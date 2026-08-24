"""Turns a user's real pay/bills/goals into a safe weekly spending number.

This is the personal-mode counterpart to the static mock fixtures: it produces
the exact same `SpendingSummary` / `Goal` shapes the existing intervention
pipeline (scoring.py, openai_client.py, the LangGraph agent) already consumes,
so nothing downstream needs to know whether the data came from a JSON fixture
or a real database row.
"""
from dataclasses import dataclass
from datetime import date
from typing import Optional

from app.models.db_models import FinancialProfile, PersonalTransaction, RecurringExpense, SavingsGoal
from app.models.schemas import Goal, SpendingSummary, Transaction
from app.services.aggregator import compute_summary

FREQUENCY_TO_WEEKLY = {
    "weekly": 1.0,
    "biweekly": 0.5,
    "monthly": 12 / 52,
}

RISK_SAVINGS_RATE = {
    "conservative": 0.10,
    "balanced": 0.20,
    "aggressive": 0.30,
}

# Guardrail: essentials + savings can never eat more than this share of income,
# so there's always some discretionary breathing room left over.
MAX_ALLOCATION_PCT = 0.90

# Cap on "days to goal" so a stalled goal (zero safe contribution) doesn't
# render as an infinite or wildly large number in the UI.
MAX_DAYS_TO_GOAL = 3650  # ~10 years


@dataclass
class BudgetPlanResult:
    weekly_income: float
    essentials_weekly: float
    savings_weekly: float
    safe_to_spend_weekly: float
    goal: Optional[Goal]
    warning: Optional[str]
    distress: bool
    spending_summary: SpendingSummary


def _to_weekly(amount: float, frequency: str) -> float:
    return amount * FREQUENCY_TO_WEEKLY.get(frequency, FREQUENCY_TO_WEEKLY["monthly"])


def _personal_txns_to_schema(rows: list[PersonalTransaction]) -> list[Transaction]:
    return [
        Transaction(
            id=t.id,
            amount=t.amount,
            category=t.category,
            merchant=t.merchant or t.category,
            date=t.date.isoformat(),
            type="purchase",
        )
        for t in rows
        if t.type == "purchase"
    ]


def compute_budget_plan(
    profile: FinancialProfile,
    expenses: list[RecurringExpense],
    goals: list[SavingsGoal],
    transactions: list[PersonalTransaction],
    today: date,
) -> BudgetPlanResult:
    weekly_income = _to_weekly(profile.pay_amount, profile.pay_frequency)
    essentials_weekly = round(sum(_to_weekly(e.amount, e.frequency) for e in expenses), 2)

    distress = essentials_weekly > weekly_income
    allocation_ceiling = weekly_income * MAX_ALLOCATION_PCT
    max_after_essentials = max(0.0, allocation_ceiling - essentials_weekly)

    primary_goal = goals[0] if goals else None
    savings_weekly = 0.0
    warning: Optional[str] = None

    if primary_goal and not distress:
        remaining = max(0.0, primary_goal.target_amount - primary_goal.current_amount)
        if primary_goal.target_date:
            weeks_remaining = max(1.0, (primary_goal.target_date - today).days / 7.0)
            desired_weekly = remaining / weeks_remaining if remaining > 0 else 0.0
        else:
            rate = RISK_SAVINGS_RATE.get(profile.risk_tolerance, 0.20)
            desired_weekly = max(0.0, weekly_income - essentials_weekly) * rate

        savings_weekly = round(min(desired_weekly, max_after_essentials), 2)

        if primary_goal.target_date and desired_weekly > max_after_essentials + 0.01 and remaining > 0:
            if savings_weekly > 0:
                safe_weeks = round(remaining / savings_weekly)
                warning = (
                    f'Hitting "{primary_goal.name}" by its target date would need '
                    f"${desired_weekly:,.2f}/week — more than we'd safely recommend. "
                    f"At a safe pace of ${savings_weekly:,.2f}/week it'll take about "
                    f"{safe_weeks} weeks instead."
                )
            else:
                warning = (
                    f'Your budget has no safe room to contribute toward "{primary_goal.name}" right now. '
                    "Consider lowering your essential expenses or extending the target date."
                )
    elif distress:
        warning = (
            "Your recurring bills add up to more than your income this week. "
            "TerpSense isn't recommending any savings contribution until this is resolved — "
            "consider reviewing your expenses first."
        )

    safe_to_spend_weekly = round(max(0.0, weekly_income - essentials_weekly - savings_weekly), 2)

    goal_out: Optional[Goal] = None
    if primary_goal:
        remaining = max(0.0, primary_goal.target_amount - primary_goal.current_amount)
        if savings_weekly > 0 and remaining > 0:
            days_to_goal = min(MAX_DAYS_TO_GOAL, round(remaining / savings_weekly * 7))
        elif remaining <= 0:
            days_to_goal = 0
        else:
            days_to_goal = MAX_DAYS_TO_GOAL
        goal_out = Goal(
            id=primary_goal.id,
            name=primary_goal.name,
            target_amount=primary_goal.target_amount,
            current_amount=primary_goal.current_amount,
            monthly_contribution_needed=round(savings_weekly * (52 / 12), 2),
            days_to_goal_at_current_pace=days_to_goal,
            created_at=primary_goal.created_at.isoformat(),
        )

    schema_txns = _personal_txns_to_schema(transactions)
    spending_summary = compute_summary(schema_txns, user_id=profile.user_id, reference_date=today)

    return BudgetPlanResult(
        weekly_income=round(weekly_income, 2),
        essentials_weekly=essentials_weekly,
        savings_weekly=savings_weekly,
        safe_to_spend_weekly=safe_to_spend_weekly,
        goal=goal_out,
        warning=warning,
        distress=distress,
        spending_summary=spending_summary,
    )

from dataclasses import dataclass, field
from typing import Optional

from app.models.schemas import Goal, SpendingSummary

# Categories where severity is capped at yellow (no harsh intervention)
ESSENTIAL_CATEGORIES = {"Groceries", "Health", "Medical", "Rent", "Utilities", "Transport"}

# Categories where alternatives are suggested
DISCRETIONARY_CATEGORIES = {"Clothing", "Entertainment", "Shopping", "Subscriptions", "Dining"}


@dataclass
class ScoreResult:
    severity: str           # "green" | "yellow" | "orange" | "red"
    score: int              # 0–100 composite
    goal_impact_days: int
    redirect_value_6mo: float
    category_week_spend: float
    category_week_avg: float
    category_month_spend: float
    category_purchase_count_week: int
    is_discretionary: bool
    # Debug fields — useful during tuning
    debug: dict = field(default_factory=dict)


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def compute_severity(
    purchase_amount: float,
    category: str,
    spending_summary: SpendingSummary,
    goal: Optional[Goal],
) -> ScoreResult:
    is_discretionary = category in DISCRETIONARY_CATEGORIES

    # --- Context values ---
    category_week_spend = spending_summary.week.get(category, 0.0)
    category_month_spend = spending_summary.month.get(category, 0.0)
    category_week_avg = max(spending_summary.category_weekly_averages.get(category, 50.0), 1.0)
    avg_weekly_spend = max(spending_summary.avg_weekly_spend, 1.0)

    # Real weekly purchase count from summary (not estimated from purchase amount)
    category_purchase_count_week = spending_summary.category_weekly_counts.get(category, 0)

    # --- Goal impact ---
    goal_impact_days = 0
    if goal:
        remaining = goal.target_amount - goal.current_amount
        if remaining > 0 and goal.days_to_goal_at_current_pace > 0:
            # Cap sensitivity to avoid exploding on nearly-complete goals
            days_per_dollar = min(goal.days_to_goal_at_current_pace / remaining, 2.0)
            goal_impact_days = round(purchase_amount * days_per_dollar)

    # -------------------------------------------------------
    # FACTOR 1: Overspend — split into existing + marginal push
    # Weight: 30 total (20 existing state, 10 marginal push)
    # -------------------------------------------------------
    current_ratio = category_week_spend / category_week_avg
    projected_ratio = (category_week_spend + purchase_amount) / category_week_avg

    # How bad is the existing state? (already over avg = starts with signal)
    factor_existing = _clamp((current_ratio - 1.0) / 1.5, 0.0, 1.0)
    # How much does THIS purchase push things further?
    factor_push = _clamp((projected_ratio - current_ratio) / 0.75, 0.0, 1.0)
    factor_overspend = factor_existing * 20 + factor_push * 10

    # -------------------------------------------------------
    # FACTOR 2: Purchase frequency this week (discretionary only)
    # Weight: 20
    # Catches repeated small purchases — the impulse pattern
    # -------------------------------------------------------
    factor_frequency = 0.0
    if is_discretionary:
        # 4+ purchases this week in this category = max signal
        factor_frequency = _clamp(category_purchase_count_week / 4.0, 0.0, 1.0) * 20

    # -------------------------------------------------------
    # FACTOR 3: Goal delay
    # Weight: 25
    # 21+ days delay → maxes out (3 weeks is meaningful)
    # -------------------------------------------------------
    goal_impact_weeks = goal_impact_days / 7.0
    factor_goal = _clamp(goal_impact_weeks / 3.0, 0.0, 1.0) * 25

    # -------------------------------------------------------
    # FACTOR 4: Purchase size relative to weekly budget
    # Weight: 15
    # A purchase ≥ 50% of weekly avg is notable
    # -------------------------------------------------------
    size_ratio = purchase_amount / avg_weekly_spend
    factor_size = _clamp(size_ratio / 0.5, 0.0, 1.0) * 15

    # -------------------------------------------------------
    # FACTOR 5: Monthly category trend
    # Weight: 10
    # If this category is elevated all month, compound the signal
    # -------------------------------------------------------
    monthly_ratio = category_month_spend / max(category_week_avg * 4.3, 1.0)
    trend_excess = max(0.0, monthly_ratio - 1.0)
    factor_trend = _clamp(trend_excess / 1.5, 0.0, 1.0) * 10

    # --- Composite score (0–100) ---
    raw_score = factor_overspend + factor_frequency + factor_goal + factor_size + factor_trend
    score = round(_clamp(raw_score, 0.0, 100.0))

    # -------------------------------------------------------
    # SEVERITY — gated by multiple strong signals for red
    # Prevents a single high factor from triggering red alone
    # -------------------------------------------------------
    strong_signals = 0
    if projected_ratio >= 2.0:
        strong_signals += 1
    if goal_impact_days >= 10:
        strong_signals += 1
    if category_purchase_count_week >= 3 and is_discretionary:
        strong_signals += 1
    if size_ratio >= 0.30:
        strong_signals += 1

    if category in ESSENTIAL_CATEGORIES:
        # Essentials aren't a spending concern by default — a real "you're good" case
        severity = "green"
    elif purchase_amount < 5:
        severity = "green"
    elif score < 15:
        # Genuinely low-signal purchase — nothing here is off pace
        severity = "green"
    elif purchase_amount < 15:
        severity = "yellow" if score < 70 else "orange"
    elif score >= 65 and strong_signals >= 2:
        severity = "red"
    elif score >= 30:
        severity = "orange"
    else:
        severity = "yellow"

    # --- Redirect value: 5% APY, 6-month approximation ---
    redirect_value_6mo = round(purchase_amount * 1.025, 2)

    debug = {
        "current_ratio": round(current_ratio, 2),
        "projected_ratio": round(projected_ratio, 2),
        "size_ratio": round(size_ratio, 2),
        "strong_signals": strong_signals,
        "f_existing": round(factor_existing, 1),
        "f_push": round(factor_push, 1),
        "f_frequency": round(factor_frequency, 1),
        "f_goal": round(factor_goal, 1),
        "f_size": round(factor_size, 1),
        "f_trend": round(factor_trend, 1),
    }

    return ScoreResult(
        severity=severity,
        score=score,
        goal_impact_days=goal_impact_days,
        redirect_value_6mo=redirect_value_6mo,
        category_week_spend=category_week_spend,
        category_week_avg=category_week_avg,
        category_month_spend=category_month_spend,
        category_purchase_count_week=category_purchase_count_week,
        is_discretionary=is_discretionary,
        debug=debug,
    )

from datetime import date as date_type
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# --- Shared domain models ---

class Transaction(BaseModel):
    id: str
    amount: float
    category: str
    merchant: str
    date: str
    type: str = "purchase"


class Goal(BaseModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    monthly_contribution_needed: float
    days_to_goal_at_current_pace: int
    created_at: str


class SpendingSummary(BaseModel):
    user_id: str
    week: dict[str, float]
    month: dict[str, float]
    total_week: float
    total_month: float
    avg_weekly_spend: float
    category_weekly_averages: dict[str, float]
    category_weekly_counts: dict[str, int] = {}
    profile_id: Optional[str] = None
    profile_name: Optional[str] = None


# --- Request models ---

class PurchaseRequest(BaseModel):
    user_id: str = "demo"
    amount: float = Field(gt=0, description="Purchase amount must be positive")
    category: str
    merchant: Optional[str] = None
    profile_id: Optional[str] = None


class DecisionRequest(BaseModel):
    user_id: str = "demo"
    purchase_amount: float
    category: str
    merchant: Optional[str] = None
    decision: Literal["proceed", "delay", "redirect", "alternative", "celebrate"]
    profile_id: Optional[str] = None


class UpdateGoalRequest(BaseModel):
    goal_id: str
    amount_to_add: float


# --- Personal mode: real financial data ---
# Amounts are bounded well above any plausible individual paycheck/bill —
# a guardrail against fat-finger inputs (e.g. an extra zero) skewing the
# budget engine into nonsensical recommendations.
MAX_PLAUSIBLE_AMOUNT = 1_000_000


class RecurringExpenseIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0, le=MAX_PLAUSIBLE_AMOUNT)
    category: str = "Other"
    frequency: Literal["weekly", "biweekly", "monthly"] = "monthly"


class SavingsGoalIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    target_amount: float = Field(gt=0, le=MAX_PLAUSIBLE_AMOUNT)
    target_date: Optional[date_type] = None


class FinancialProfileRequest(BaseModel):
    pay_amount: float = Field(gt=0, le=MAX_PLAUSIBLE_AMOUNT)
    pay_frequency: Literal["weekly", "biweekly", "monthly"]
    next_pay_date: date_type
    risk_tolerance: Literal["conservative", "balanced", "aggressive"] = "balanced"
    expenses: List[RecurringExpenseIn] = []
    goal: Optional[SavingsGoalIn] = None


class BudgetPlanOut(BaseModel):
    weekly_income: float
    essentials_weekly: float
    savings_weekly: float
    safe_to_spend_weekly: float
    warning: Optional[str] = None
    distress: bool = False


class FinancialProfileResponse(BaseModel):
    pay_amount: float
    pay_frequency: str
    next_pay_date: str
    risk_tolerance: str
    expenses: List[RecurringExpenseIn]
    goal: Optional[Goal] = None
    budget: BudgetPlanOut
    spending_summary: SpendingSummary


class PersonalTransactionIn(BaseModel):
    amount: float = Field(gt=0, le=MAX_PLAUSIBLE_AMOUNT)
    category: str
    merchant: Optional[str] = None
    date: date_type
    type: Literal["purchase", "income"] = "purchase"


class PersonalTransactionsResponse(BaseModel):
    transactions: List[Transaction]


# --- Response models ---

class TransactionsResponse(BaseModel):
    user_id: str
    transactions: List[Transaction]


class GoalsResponse(BaseModel):
    user_id: str
    goals: List[Goal]


class InterventionResponse(BaseModel):
    severity: Literal["green", "yellow", "orange", "red"]
    insights: List[str]
    goal_impact_days: int
    redirect_value_6mo: float
    alternative_suggestion: Optional[str]
    summary_line: str
    score: int
    recommended_action: Optional[str] = None
    confidence: Optional[float] = None


class DecisionResponse(BaseModel):
    acknowledged: bool
    decision: str
    updated_goal_amount: Optional[float] = None
    confirmation_message: str


class UpdateGoalResponse(BaseModel):
    goal_id: str
    new_amount: float
    target: float
    percent_complete: float

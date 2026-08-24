from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.db_models import FinancialProfile, PersonalTransaction, RecurringExpense, SavingsGoal, User
from app.models.schemas import (
    FinancialProfileRequest,
    FinancialProfileResponse,
    PersonalTransactionIn,
    PersonalTransactionsResponse,
    RecurringExpenseIn,
    Transaction,
)
from app.services.auth import get_current_user
from app.services.budgeting import compute_budget_plan

router = APIRouter(tags=["financial-profile"])


def _load_profile(db: Session, user: User) -> FinancialProfile:
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No financial profile yet — complete onboarding first")
    return profile


@router.get("/financial-profile", response_model=FinancialProfileResponse)
def get_financial_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = _load_profile(db, user)
    return _build_response(db, profile)


@router.post("/financial-profile", response_model=FinancialProfileResponse)
def upsert_financial_profile(
    body: FinancialProfileRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()

    if profile:
        profile.pay_amount = body.pay_amount
        profile.pay_frequency = body.pay_frequency
        profile.next_pay_date = body.next_pay_date
        profile.risk_tolerance = body.risk_tolerance
        db.query(RecurringExpense).filter(RecurringExpense.profile_id == profile.id).delete()
    else:
        profile = FinancialProfile(
            user_id=user.id,
            pay_amount=body.pay_amount,
            pay_frequency=body.pay_frequency,
            next_pay_date=body.next_pay_date,
            risk_tolerance=body.risk_tolerance,
        )
        db.add(profile)
        db.flush()

    for e in body.expenses:
        db.add(
            RecurringExpense(
                profile_id=profile.id, name=e.name, amount=e.amount, category=e.category, frequency=e.frequency
            )
        )

    if body.goal:
        existing_goal = db.query(SavingsGoal).filter(SavingsGoal.profile_id == profile.id).first()
        if existing_goal:
            existing_goal.name = body.goal.name
            existing_goal.target_amount = body.goal.target_amount
            existing_goal.target_date = body.goal.target_date
        else:
            db.add(
                SavingsGoal(
                    profile_id=profile.id,
                    name=body.goal.name,
                    target_amount=body.goal.target_amount,
                    current_amount=0.0,
                    target_date=body.goal.target_date,
                )
            )

    db.commit()
    db.refresh(profile)
    return _build_response(db, profile)


def _build_response(db: Session, profile: FinancialProfile) -> FinancialProfileResponse:
    expenses = db.query(RecurringExpense).filter(RecurringExpense.profile_id == profile.id).all()
    goals = db.query(SavingsGoal).filter(SavingsGoal.profile_id == profile.id).all()
    transactions = db.query(PersonalTransaction).filter(PersonalTransaction.profile_id == profile.id).all()

    plan = compute_budget_plan(profile, expenses, goals, transactions, today=date.today())

    return FinancialProfileResponse(
        pay_amount=profile.pay_amount,
        pay_frequency=profile.pay_frequency,
        next_pay_date=profile.next_pay_date.isoformat(),
        risk_tolerance=profile.risk_tolerance,
        expenses=[
            RecurringExpenseIn(name=e.name, amount=e.amount, category=e.category, frequency=e.frequency)
            for e in expenses
        ],
        goal=plan.goal,
        budget={
            "weekly_income": plan.weekly_income,
            "essentials_weekly": plan.essentials_weekly,
            "savings_weekly": plan.savings_weekly,
            "safe_to_spend_weekly": plan.safe_to_spend_weekly,
            "warning": plan.warning,
            "distress": plan.distress,
        },
        spending_summary=plan.spending_summary,
    )


@router.get("/personal-transactions", response_model=PersonalTransactionsResponse)
def list_personal_transactions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    profile = _load_profile(db, user)
    rows = (
        db.query(PersonalTransaction)
        .filter(PersonalTransaction.profile_id == profile.id)
        .order_by(PersonalTransaction.date.desc())
        .all()
    )
    return PersonalTransactionsResponse(
        transactions=[
            Transaction(
                id=t.id,
                amount=t.amount,
                category=t.category,
                merchant=t.merchant or t.category,
                date=t.date.isoformat(),
                type="purchase",
            )
            for t in rows
        ]
    )


@router.post("/personal-transactions", response_model=PersonalTransactionsResponse)
def log_personal_transaction(
    body: PersonalTransactionIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = _load_profile(db, user)
    db.add(
        PersonalTransaction(
            profile_id=profile.id,
            amount=body.amount,
            category=body.category,
            merchant=body.merchant or "",
            date=body.date,
            type=body.type,
        )
    )
    db.commit()
    return list_personal_transactions(db=db, user=user)

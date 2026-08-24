import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_provider: Mapped[str] = mapped_column(String, default="credentials")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    financial_profile: Mapped["FinancialProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    pay_amount: Mapped[float] = mapped_column(Float, nullable=False)
    pay_frequency: Mapped[str] = mapped_column(String, nullable=False)  # weekly | biweekly | monthly
    next_pay_date: Mapped[date] = mapped_column(Date, nullable=False)
    risk_tolerance: Mapped[str] = mapped_column(String, default="balanced")  # conservative | balanced | aggressive

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="financial_profile")
    expenses: Mapped[list["RecurringExpense"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
    goals: Mapped[list["SavingsGoal"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["PersonalTransaction"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    profile_id: Mapped[str] = mapped_column(ForeignKey("financial_profiles.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[str] = mapped_column(String, default="Other")
    frequency: Mapped[str] = mapped_column(String, default="monthly")  # weekly | biweekly | monthly

    profile: Mapped["FinancialProfile"] = relationship(back_populates="expenses")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    profile_id: Mapped[str] = mapped_column(ForeignKey("financial_profiles.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, nullable=False)
    target_amount: Mapped[float] = mapped_column(Float, nullable=False)
    current_amount: Mapped[float] = mapped_column(Float, default=0.0)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["FinancialProfile"] = relationship(back_populates="goals")


class PersonalTransaction(Base):
    __tablename__ = "personal_transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    profile_id: Mapped[str] = mapped_column(ForeignKey("financial_profiles.id"), nullable=False)

    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    merchant: Mapped[str] = mapped_column(String, default="")
    date: Mapped[date] = mapped_column(Date, nullable=False)
    type: Mapped[str] = mapped_column(String, default="purchase")  # purchase | income
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["FinancialProfile"] = relationship(back_populates="transactions")

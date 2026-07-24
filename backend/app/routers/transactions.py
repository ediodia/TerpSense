from typing import Optional

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.schemas import SpendingSummary, TransactionsResponse
from app.services import aggregator, nessie
from app.services.profiles import get_account_id, get_profile

router = APIRouter()


@router.get("/transactions", response_model=TransactionsResponse)
async def get_transactions(user_id: str = "demo", days: int = 30, profile_id: Optional[str] = None):
    try:
        account_id = get_account_id(profile_id)
        transactions = await nessie.get_transactions(user_id, account_id=account_id, profile_id=profile_id)
        return TransactionsResponse(user_id=user_id, transactions=transactions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spending-summary", response_model=SpendingSummary)
async def get_spending_summary(user_id: str = "demo", profile_id: Optional[str] = None):
    try:
        if settings.use_mock_data:
            return aggregator.load_precomputed_summary(user_id, profile_id=profile_id)

        account_id = get_account_id(profile_id)
        transactions = await nessie.get_transactions(user_id, account_id=account_id, profile_id=profile_id)
        summary = aggregator.compute_summary(transactions, user_id)

        # Attach profile metadata so the frontend knows who's active
        profile = get_profile(profile_id)
        summary.profile_id = profile["id"]
        summary.profile_name = profile["name"]
        return summary

    except Exception as e:
        try:
            return aggregator.load_precomputed_summary(user_id, profile_id=profile_id)
        except Exception:
            raise HTTPException(status_code=500, detail=str(e))

import asyncio

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    DecisionRequest,
    DecisionResponse,
    InterventionResponse,
    PurchaseRequest,
)
from app.services import nessie, openai_client, scoring
from app.services.aggregator import compute_summary, load_precomputed_summary
from app.services.profiles import get_account_id
from app.state import goal_state
from app.config import settings as _settings
from app.agent.graph import run_financial_agent
from app.agent.memory import save_decision

router = APIRouter()

CONFIRMATION_MESSAGES = {
    "redirect": "Smart move. Your savings goal just got closer.",
    "delay": "Got it. Come back in 7 days if you still want it.",
    "proceed": "Noted. No judgment — just keeping you informed.",
    "alternative": "Good thinking. A cheaper option could save you real money.",
    "celebrate": "Fantastic choice! You've got the room for it — enjoy it.",
}


@router.post("/analyze-purchase", response_model=InterventionResponse)
async def analyze_purchase(body: PurchaseRequest):
    try:
        # Try LangGraph agent first
        try:
            purchase_dict = {
                "name": body.merchant or body.category,
                "category": body.category,
                "price": body.amount,
            }
            agent_result = run_financial_agent(body.user_id, purchase_dict, profile_id=body.profile_id)
            if agent_result:
                return InterventionResponse(
                    severity=agent_result.get("severity", "yellow"),
                    insights=agent_result.get("insights", []),
                    goal_impact_days=agent_result.get("goal_impact_days", 0),
                    redirect_value_6mo=agent_result.get("redirect_value_6mo", 0),
                    alternative_suggestion=agent_result.get("alternative_suggestion"),
                    summary_line=agent_result.get("summary_line", ""),
                    score=agent_result.get("score", 50),
                    recommended_action=agent_result.get("recommended_action"),
                    confidence=agent_result.get("confidence"),
                )
        except Exception:
            pass  # Fall through to existing logic

        # Fallback: existing logic
        account_id = get_account_id(body.profile_id)
        goals, transactions = await asyncio.gather(
            nessie.get_goals(body.user_id, profile_id=body.profile_id),
            nessie.get_transactions(body.user_id, account_id=account_id, profile_id=body.profile_id),
        )
        from app.config import settings
        spending_summary = (
            load_precomputed_summary(body.user_id, profile_id=body.profile_id)
            if settings.use_mock_data
            else compute_summary(transactions, body.user_id)
        )
        goal = goals[0] if goals else None

        if goal:
            override = goal_state.get(goal.id)
            if override is not None:
                goal = goal.model_copy(update={"current_amount": override})

        score_result = scoring.compute_severity(
            purchase_amount=body.amount,
            category=body.category,
            spending_summary=spending_summary,
            goal=goal,
        )

        ai_output = openai_client.call_openai(
            purchase_amount=body.amount,
            category=body.category,
            merchant=body.merchant,
            score_result=score_result,
            goal=goal,
            spending_summary=spending_summary,
            recent_transactions=transactions[:8],
        )

        return InterventionResponse(
            severity=score_result.severity,
            insights=ai_output["insights"],
            goal_impact_days=score_result.goal_impact_days,
            redirect_value_6mo=score_result.redirect_value_6mo,
            alternative_suggestion=ai_output.get("alternative_suggestion"),
            summary_line=ai_output["summary_line"],
            score=score_result.score,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/record-decision", response_model=DecisionResponse)
async def record_decision(body: DecisionRequest):
    try:
        updated_goal_amount = None

        # Save to behavior memory for LangGraph
        try:
            save_decision(
                user_id=body.user_id,
                purchase={
                    "price": body.purchase_amount,
                    "category": body.category,
                },
                recommended_action="redirect",
                actual_decision=body.decision,
            )
        except Exception:
            pass

        if body.decision == "redirect":
            goals = await nessie.get_goals(body.user_id, profile_id=body.profile_id)
            if goals:
                goal = goals[0]
                current = goal_state.get(goal.id, goal.current_amount)
                new_amount = round(min(current + body.purchase_amount, goal.target_amount), 2)
                goal_state[goal.id] = new_amount
                updated_goal_amount = new_amount

        elif body.decision in ("proceed", "celebrate") and not _settings.use_mock_data:
            account_id = get_account_id(body.profile_id)
            description = body.merchant or body.category
            await nessie.create_purchase(
                amount=body.purchase_amount,
                description=description,
                account_id=account_id,
            )

        message = CONFIRMATION_MESSAGES.get(body.decision, "Decision recorded.")

        return DecisionResponse(
            acknowledged=True,
            decision=body.decision,
            updated_goal_amount=updated_goal_amount,
            confirmation_message=message,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-demo")
async def reset_demo():
    from app.state import reset_demo_state
    reset_demo_state()
    return {"reset": True}
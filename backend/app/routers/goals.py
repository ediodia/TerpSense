from typing import Optional

from fastapi import APIRouter, HTTPException

from app.models.schemas import GoalsResponse, UpdateGoalRequest, UpdateGoalResponse
from app.services import nessie
from app.state import goal_state

router = APIRouter()


@router.get("/goals", response_model=GoalsResponse)
async def get_goals(user_id: str = "demo", profile_id: Optional[str] = None):
    try:
        goals = await nessie.get_goals(user_id, profile_id=profile_id)

        # Apply any in-memory mutations from this session
        updated = []
        for g in goals:
            override = goal_state.get(g.id)
            if override is not None:
                g = g.model_copy(update={"current_amount": override})
            updated.append(g)

        return GoalsResponse(user_id=user_id, goals=updated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/update-goal", response_model=UpdateGoalResponse)
async def update_goal(body: UpdateGoalRequest):
    try:
        goals = await nessie.get_goals("demo")
        goal = next((g for g in goals if g.id == body.goal_id), None)

        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

        current = goal_state.get(goal.id, goal.current_amount)
        new_amount = round(min(current + body.amount_to_add, goal.target_amount), 2)
        goal_state[goal.id] = new_amount

        return UpdateGoalResponse(
            goal_id=goal.id,
            new_amount=new_amount,
            target=goal.target_amount,
            percent_complete=round((new_amount / goal.target_amount) * 100, 1),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

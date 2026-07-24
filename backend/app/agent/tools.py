import json
import os
from app.agent.state import AgentState
from app.services.profiles import mock_file_suffix

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _load_json(filename: str) -> dict | list:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)


def load_transactions(state: AgentState) -> AgentState:
    suffix = mock_file_suffix(state.get("profile_id"))
    transactions = _load_json(f"mock_transactions{suffix}.json")
    state["transactions"] = transactions if isinstance(transactions, list) else []
    return state


def load_spending_summary(state: AgentState) -> AgentState:
    suffix = mock_file_suffix(state.get("profile_id"))
    summary = _load_json(f"mock_spending_summary{suffix}.json")
    week = summary.get("week", {}) if isinstance(summary, dict) else {}
    state["spending_summary"] = week
    return state


def load_goal(state: AgentState) -> AgentState:
    suffix = mock_file_suffix(state.get("profile_id"))
    goals = _load_json(f"mock_goals{suffix}.json")
    state["goal"] = goals[0] if isinstance(goals, list) and goals else None
    return state


def compute_score(state: AgentState) -> AgentState:
    purchase = state["purchase"]
    price = purchase.get("price", 0)
    category = purchase.get("category", "")
    spending_summary = state.get("spending_summary", {})
    goal = state.get("goal")

    category_spent = spending_summary.get(category, 0)
    total_spent = sum(spending_summary.values()) if spending_summary else 1

    score = min(100, int((price / max(total_spent, 1)) * 100))
    if category_spent > 100:
        score = min(100, score + 20)

    if score >= 70:
        severity = "red"
    elif score >= 40:
        severity = "orange"
    else:
        severity = "yellow"

    goal_impact_days = 0
    if goal:
        daily = goal.get("daily_contribution", 10)
        goal_impact_days = max(0, int(price / daily))

    redirect_value_6mo = round(price * 1.025, 2)

    state["score_result"] = {
        "score": score,
        "severity": severity,
        "goal_impact_days": goal_impact_days,
        "redirect_value_6mo": redirect_value_6mo,
        "category_spent": category_spent,
        "total_spent": total_spent,
    }
    return state


def load_behavior_memory(state: AgentState) -> AgentState:
    from app.agent.memory import get_user_memory
    state["behavior_memory"] = get_user_memory(state["user_id"])
    return state


def build_final_response(state: AgentState) -> AgentState:
    score = state.get("score_result", {})
    llm = state.get("llm_result", {})

    state["final_response"] = {
        "severity": score.get("severity", "yellow"),
        "score": score.get("score", 50),
        "goal_impact_days": score.get("goal_impact_days", 0),
        "redirect_value_6mo": score.get("redirect_value_6mo", 0),
        "recommended_action": llm.get("recommended_action", "delay"),
        "confidence": llm.get("confidence", 0.7),
        "insights": llm.get("insights", []),
        "alternative_suggestion": llm.get("alternative_suggestion", ""),
        "summary_line": llm.get("summary_line", "Consider your options carefully."),
    }
    return state
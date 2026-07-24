import json
from langgraph.graph import StateGraph, END
from app.agent.state import AgentState
from app.agent.tools import (
    load_transactions,
    load_spending_summary,
    load_goal,
    load_behavior_memory,
    build_final_response,
)
from app.agent.memory import get_behavior_indicators
from app.services import openai_client as openai_service
from app.services import scoring as scoring_service
from app.models.schemas import Goal, SpendingSummary, Transaction


def compute_score_node(state: AgentState) -> AgentState:
    """Use the real scoring module instead of the simplified version in tools.py."""
    purchase = state["purchase"]
    price = float(purchase.get("price", 0))
    category = purchase.get("category", "")

    # Build a proper SpendingSummary from the week dict in state
    week_data = state.get("spending_summary", {})
    goal_raw = state.get("goal")

    # Construct a minimal SpendingSummary Pydantic object
    total_week = sum(week_data.values()) if week_data else 0
    summary = SpendingSummary(
        user_id=state["user_id"],
        week=week_data,
        month={},
        total_week=total_week,
        total_month=0,
        avg_weekly_spend=total_week,  # single week, so avg == current
        category_weekly_averages={cat: amt * 0.7 for cat, amt in week_data.items()},
        category_weekly_counts={},
    )

    # Build a Goal object if present
    goal = None
    if goal_raw and isinstance(goal_raw, dict):
        try:
            goal = Goal(**goal_raw)
        except Exception:
            goal = None
    elif isinstance(goal_raw, Goal):
        goal = goal_raw

    score_result = scoring_service.compute_severity(
        purchase_amount=price,
        category=category,
        spending_summary=summary,
        goal=goal,
    )

    state["score_result"] = {
        "severity": score_result.severity,
        "score": score_result.score,
        "goal_impact_days": score_result.goal_impact_days,
        "redirect_value_6mo": score_result.redirect_value_6mo,
        "category_week_spend": score_result.category_week_spend,
        "category_week_avg": score_result.category_week_avg,
        "is_discretionary": score_result.is_discretionary,
    }
    # Store typed objects for LLM node
    state["_summary_obj"] = summary
    state["_goal_obj"] = goal
    state["_score_obj"] = score_result
    return state


def call_llm_recommendation(state: AgentState) -> AgentState:
    purchase = state["purchase"]
    score_result = state.get("_score_obj")
    summary = state.get("_summary_obj")
    goal = state.get("_goal_obj")

    # Build Transaction objects from raw dicts
    raw_txs = state.get("transactions", [])
    transactions = []
    for t in raw_txs[:8]:
        try:
            transactions.append(Transaction(**t) if isinstance(t, dict) else t)
        except Exception:
            pass

    try:
        result = openai_service.call_openai(
            purchase_amount=float(purchase.get("price", 0)),
            category=purchase.get("category", ""),
            merchant=purchase.get("name"),
            score_result=score_result,
            goal=goal,
            spending_summary=summary,
            recent_transactions=transactions,
        )
        state["llm_result"] = result
    except Exception:
        state["llm_result"] = {
            "insights": [
                f"You've already spent ${state['score_result'].get('category_week_spend', 0):.2f} "
                f"on {purchase.get('category', 'this category')} this week.",
                f"This purchase delays your savings goal by "
                f"{state['score_result'].get('goal_impact_days', 0)} days.",
            ],
            "alternative_suggestion": None,
            "summary_line": f"Redirecting ${purchase.get('price', 0):.2f} could grow to "
                            f"${state['score_result'].get('redirect_value_6mo', 0):.2f} in 6 months.",
        }

    return state


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("load_transactions", load_transactions)
    graph.add_node("load_spending_summary", load_spending_summary)
    graph.add_node("load_goal", load_goal)
    graph.add_node("compute_score", compute_score_node)
    graph.add_node("load_behavior_memory", load_behavior_memory)
    graph.add_node("call_llm_recommendation", call_llm_recommendation)
    graph.add_node("build_final_response", build_final_response)

    graph.set_entry_point("load_transactions")
    graph.add_edge("load_transactions", "load_spending_summary")
    graph.add_edge("load_spending_summary", "load_goal")
    graph.add_edge("load_goal", "compute_score")
    graph.add_edge("compute_score", "load_behavior_memory")
    graph.add_edge("load_behavior_memory", "call_llm_recommendation")
    graph.add_edge("call_llm_recommendation", "build_final_response")
    graph.add_edge("build_final_response", END)

    return graph.compile()


compiled_graph = build_graph()


def run_financial_agent(user_id: str, purchase: dict, profile_id: str | None = None) -> dict:
    initial_state: AgentState = {
        "user_id": user_id,
        "profile_id": profile_id,
        "purchase": purchase,
        "transactions": [],
        "spending_summary": {},
        "goal": None,
        "score_result": None,
        "behavior_memory": [],
        "llm_result": None,
        "final_response": None,
    }
    result = compiled_graph.invoke(initial_state)
    return result.get("final_response", {})

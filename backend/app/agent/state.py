from typing import Any, Optional
from typing_extensions import TypedDict


class Purchase(TypedDict):
    name: str
    category: str
    price: float


class AgentState(TypedDict):
    user_id: str
    profile_id: Optional[str]
    purchase: Purchase
    transactions: list
    spending_summary: dict
    goal: Optional[Any]
    score_result: Optional[dict]
    behavior_memory: list
    llm_result: Optional[dict]
    final_response: Optional[dict]
    # Typed objects passed between nodes (not serialized to final response)
    _summary_obj: Optional[Any]
    _goal_obj: Optional[Any]
    _score_obj: Optional[Any]
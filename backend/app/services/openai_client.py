import json
import logging
from typing import List, Optional

from openai import AzureOpenAI

from app.config import settings
from app.models.schemas import Goal, SpendingSummary, Transaction
from app.services.scoring import ScoreResult

logger = logging.getLogger(__name__)

# --- Hardcoded fallback for demo reliability ---
FALLBACK_INTERVENTION = {
    "insights": [
        "You've already spent significantly on this category this week.",
        "This purchase conflicts with your active savings goal.",
    ],
    "alternative_suggestion": "Consider checking ThredUp or Depop for lower-cost alternatives.",
    "summary_line": "Pausing on this purchase could help you reach your savings goal faster.",
}


def _get_client() -> Optional[AzureOpenAI]:
    if not settings.azure_openai_key or not settings.azure_openai_endpoint:
        return None
    return AzureOpenAI(
        api_key=settings.azure_openai_key,
        azure_endpoint=settings.azure_openai_endpoint,
        api_version=settings.azure_openai_api_version,
    )


def build_system_prompt() -> str:
    return """You are TerpSense, a financial intervention AI assistant.

Your job: when a user is about to make a purchase, analyze their full spending context and return a grounded, specific intervention.

Rules:
- Every insight MUST reference a specific dollar amount or number from the provided data. No generic advice.
- Use the full weekly spending breakdown and recent transactions to identify patterns across categories, not just the purchase category.
- Be direct and helpful. Never preachy, never shame-inducing.
- Tone: "Here's what the numbers show" — not "You really should stop."
- Keep insights concise (1–2 sentences each).
- For alternative_suggestion: suggest a specific, realistic cheaper alternative (different store, secondhand, subscription already owned, DIY, etc.). Only for discretionary categories. Make it concrete, not vague.
- summary_line is one sentence that captures the most important thing the user should know.

Return ONLY valid JSON — no markdown, no extra text, no explanation."""


def build_user_message(
    purchase_amount: float,
    category: str,
    merchant: Optional[str],
    score_result: ScoreResult,
    goal: Optional[Goal],
    spending_summary: Optional[SpendingSummary] = None,
    recent_transactions: Optional[List[Transaction]] = None,
) -> str:
    merchant_str = f" at {merchant}" if merchant else ""

    # --- Goal block ---
    goal_block = "None active"
    if goal:
        goal_block = (
            f"Name: {goal.name}\n"
            f"Progress: ${goal.current_amount:.2f} saved of ${goal.target_amount:.2f} target\n"
            f"Monthly contribution needed: ${goal.monthly_contribution_needed:.2f}\n"
            f"Days to goal at current pace: {goal.days_to_goal_at_current_pace} days\n"
            f"Impact of this purchase: delays goal by {score_result.goal_impact_days} days"
        )

    # --- Full weekly spending breakdown ---
    weekly_block = ""
    if spending_summary and spending_summary.week:
        lines = [f"  - {cat}: ${amt:.2f}" for cat, amt in sorted(spending_summary.week.items(), key=lambda x: -x[1])]
        weekly_block = (
            f"Full weekly spending breakdown (all categories):\n"
            + "\n".join(lines)
            + f"\n  - Total this week: ${spending_summary.total_week:.2f}"
            + f"\n  - Typical weekly average: ${spending_summary.avg_weekly_spend:.2f}"
        )
    else:
        weekly_block = f"Weekly spending in {category}: ${score_result.category_week_spend:.2f}"

    # --- Recent transactions ---
    tx_block = ""
    if recent_transactions:
        recent = recent_transactions[:8]
        lines = [f"  - ${t.amount:.2f} at {t.merchant} ({t.category}) on {t.date}" for t in recent]
        tx_block = "Recent transactions:\n" + "\n".join(lines)
    else:
        tx_block = "Recent transactions: not available"

    return f"""Analyze this pending purchase and return a financial intervention.

Purchase: ${purchase_amount:.2f}{merchant_str} ({category})

{weekly_block}

{tx_block}

Savings goal:
{goal_block}

Pre-computed values (use these exact numbers — do not recalculate):
- Severity: {score_result.severity}
- {category} spend this week so far: ${score_result.category_week_spend:.2f}
- {category} typical weekly average: ${score_result.category_week_avg:.2f}
- Goal impact: {score_result.goal_impact_days} days delayed
- Redirect value (6 months at 5% APY): ${score_result.redirect_value_6mo:.2f}
- Is discretionary category: {score_result.is_discretionary}

Return this exact JSON format:
{{
  "insights": ["<specific insight citing real numbers>", "<second insight citing real numbers>"],
  "alternative_suggestion": "<concrete cheaper alternative if discretionary, otherwise null>",
  "summary_line": "<one sentence capturing the most important thing to know>"
}}"""


def call_openai(
    purchase_amount: float,
    category: str,
    merchant: Optional[str],
    score_result: ScoreResult,
    goal: Optional[Goal],
    spending_summary: Optional[SpendingSummary] = None,
    recent_transactions: Optional[List[Transaction]] = None,
) -> dict:
    client = _get_client()

    if client is None:
        logger.warning("Azure OpenAI not configured — using fallback intervention.")
        return _build_contextual_fallback(purchase_amount, category, score_result, goal)

    system_prompt = build_system_prompt()
    user_message = build_user_message(
        purchase_amount, category, merchant, score_result, goal,
        spending_summary, recent_transactions
    )

    try:
        response = client.chat.completions.create(
            model=settings.azure_openai_deployment,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.4,
            max_completion_tokens=500,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        parsed = json.loads(raw)

        if "insights" not in parsed or not isinstance(parsed["insights"], list):
            raise ValueError("Missing or invalid 'insights' in AI response")

        return {
            "insights": parsed.get("insights", FALLBACK_INTERVENTION["insights"]),
            "alternative_suggestion": parsed.get("alternative_suggestion"),
            "summary_line": parsed.get("summary_line", FALLBACK_INTERVENTION["summary_line"]),
        }

    except Exception as e:
        logger.error(f"Azure OpenAI call failed: {e}")
        return _build_contextual_fallback(purchase_amount, category, score_result, goal)


def _build_contextual_fallback(
    purchase_amount: float,
    category: str,
    score_result: ScoreResult,
    goal: Optional[Goal],
) -> dict:
    insights = []

    if score_result.category_week_spend > 0:
        new_total = score_result.category_week_spend + purchase_amount
        insights.append(
            f"You've spent ${score_result.category_week_spend:.2f} on {category} this week. "
            f"This purchase would bring it to ${new_total:.2f}."
        )
    else:
        insights.append(f"This ${purchase_amount:.2f} purchase is in your {category} category.")

    if goal and score_result.goal_impact_days > 0:
        insights.append(
            f"This purchase would delay your {goal.name} goal by {score_result.goal_impact_days} days."
        )
    elif score_result.category_week_spend > score_result.category_week_avg:
        insights.append(
            f"Your {category} spending this week (${score_result.category_week_spend:.2f}) "
            f"is above your typical ${score_result.category_week_avg:.2f} weekly average."
        )

    alternative = None
    if score_result.is_discretionary and category == "Clothing":
        alternative = "Similar items are often available on ThredUp or Depop for 50–70% less."
    elif score_result.is_discretionary and category == "Entertainment":
        alternative = "Check if this is available through a subscription you already have."

    summary = (
        f"Redirecting this ${purchase_amount:.2f} to savings could grow to "
        f"${score_result.redirect_value_6mo:.2f} in 6 months."
    )

    return {
        "insights": insights[:2],
        "alternative_suggestion": alternative,
        "summary_line": summary,
    }

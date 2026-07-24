# TerpSense

**Real time AI financial intervention agent.**

> "We don't track your money. We change your behavior."

TerpSense intercepts purchase decisions *before* they happen. When you are about to buy something, it analyzes your spending history, savings goals, and behavioral patterns, then intervenes with personalized, number grounded insights, better alternatives, and **Kaizen** — an interactive AI copilot that helps users ask follow up questions before deciding.

Built for **Bitcamp 2026** using Capital One Nessie mock data, Azure OpenAI, and **LangGraph** for the AI agent workflow.

**Live demo:** [terp-sense.vercel.app](https://terp-sense.vercel.app)

---

## Highlights

- **Four-tier severity system** — not just "risky": a genuinely low-risk purchase now surfaces a green **"Fantastic Choice!"** state with its own 5th, celebratory decision option, instead of every purchase reading as some flavor of a warning
- **Three distinct demo personas** (Alex, Jordan, Sam), each with real, independent transactions, spending patterns, and savings goals — switching profiles actually changes the data, not just the name on the header
- **Kaizen**, the in-app AI copilot, with its own logo and persona, answering follow-up questions grounded in the same real numbers as the analysis
- **Gamification** — streaks, cumulative XP with levels, and a first-visit guided tour, all backed by real per-profile state instead of static numbers
- **A five-scene animated outcome sequence** — one signature mini-animation per decision, including a three-act cutscene for "proceed" (exit pictogram → sprint through Shibuya station → catching the train → riding past a scrolling Tokyo skyline)

---

## The Problem

Young adults do not struggle with money because they lack charts or dashboards. They struggle because of **impulse**. Most finance apps explain mistakes *after* the money is already gone. TerpSense changes behavior in real time before the decision is finalized.

---

## Demo Flow

1. **Dashboard**: View your spending summary, savings goal, streak, and recent transactions — switch between three demo profiles to see how the same purchase reads differently for different spending habits
2. **Check a Purchase**: Enter an amount, category, and merchant
3. **Intervention**: The LangGraph powered AI agent analyzes the purchase against your patterns and goal, landing on one of four severity tiers (green/yellow/orange/red)
4. **Ask Kaizen**: Use the copilot on the intervention page to ask follow up questions like "Can I afford this?", "What should I do instead?", or "Help me save"
5. **Decide**: Redirect to savings, delay, find an alternative, proceed anyway — or, for a green-tier "Fantastic Choice!" purchase, a 5th celebratory option
6. **Outcome**: Watch a decision-specific animated scene play out, and see your goal update in real time if you redirect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS v4 |
| Backend | FastAPI, Python |
| AI | Azure OpenAI (GPT-5.4-mini), TerpAI LangGraph |
| Mock Data | Capital One Nessie API |
| State | In memory session state |

---

## Project Structure

\```text
terpsense/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── models/
│   │   └── data/
│   └── requirements.txt
└── frontend/
    ├── app/
    ├── components/
    ├── lib/
    ├── store/
    └── types/
\```

---

## Running Locally

### Backend

**macOS / Linux (bash):**

\```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
touch .env   # then fill in the values below
uvicorn app.main:app --reload --port 8000
\```

**Windows (PowerShell):**

\```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
New-Item .env   # then fill in the values below
uvicorn app.main:app --reload --port 8000
\```

> Note: this repo does not currently ship a `.env.example`, create `.env` directly and fill in the variables from the section below.

### Frontend

**macOS / Linux (bash):**

\```bash
cd frontend
npm install
touch .env.local   # then fill in the values below
npm run dev
\```

**Windows (PowerShell):**

\```powershell
cd frontend
npm install
New-Item .env.local   # then fill in the values below
npm run dev
\```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend (`backend/.env`)

\```text
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=https://your_resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5.4-mini
AZURE_OPENAI_API_VERSION=2024-12-01-preview
NESSIE_API_KEY=your_nessie_key
USE_MOCK_DATA=true
\```

> Deployment names and API versions are tied to whatever model you deploy in the Azure Portal, if you deploy a different model, update `AZURE_OPENAI_DEPLOYMENT` and `AZURE_OPENAI_API_VERSION` to match the values shown on that deployment's "Get Started" page.

### Frontend (`frontend/.env.local`)

\```text
NEXT_PUBLIC_API_URL=http://localhost:8000
\```

Set `USE_MOCK_DATA=true` to use local JSON fixtures instead of the live Nessie API. Recommended for demos.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/profiles` | List the demo profiles (Alex, Jordan, Sam) |
| GET | `/transactions` | Fetch recent transactions for a profile |
| GET | `/spending-summary` | Aggregated category spending for a profile |
| GET | `/goals` | Active savings goals for a profile |
| POST | `/update-goal` | Manually add a contribution to a goal |
| POST | `/analyze-purchase` | Run AI intervention analysis |
| POST | `/record-decision` | Log user decision, update goal |
| POST | `/reset-demo` | Reset session state for demo |
| POST | `/api/chat` | Chat with Kaizen about the current purchase decision |

All of `/transactions`, `/spending-summary`, `/goals`, and `/analyze-purchase` accept a `profile_id` query/body param (`alex`, `jordan`, or `sam`) — each profile is backed by its own mock data, not a shared fixture.

---

## How the AI Works

The backend computes all numbers deterministically:

- **Severity**: a composite score from category overspend, purchase frequency, goal conflict, purchase size, and monthly trend, bucketed into four tiers — `green` ("Fantastic Choice!" — essentials, sub-$5 purchases, or a genuinely low-signal score), `yellow`, `orange`, and `red` (gated behind multiple strong signals, not a single high factor)
- **Goal impact days**: $Purchase\_Amount \times (\frac{Days\_Remaining}{Remaining\_To\_Goal})$
- **Redirect value**: simple 5% APY approximation over 6 months

LangGraph is used to power the AI agent workflow. It orchestrates the intervention process by:

- loading spending and transaction context
- pulling savings goal information
- incorporating lightweight behavior memory
- calling Azure OpenAI to generate a recommendation
- returning a structured next best action

Azure OpenAI only generates natural language and agent recommendations:

- `insights`: 2 personalized sentences citing real numbers
- `alternative_suggestion`: cheaper option for discretionary categories
- `summary_line`: one sentence summary

The intervention page also includes Kaizen, an interactive copilot powered by the same AI workflow. After the initial analysis, users can ask follow up questions about the purchase, such as whether they can afford it, what a better option would be, or how the decision affects their financial goals. This makes the experience more conversational and action oriented instead of stopping at a static recommendation.

A hardcoded contextual fallback runs if the AI call fails, so the demo never breaks.

---

## Demo Scenario

| Field | Value |
|---|---|
| Purchase | $89.00 at ASOS |
| Category | Clothing |
| Clothing spend this week | $143 (already) |
| Savings goal | Emergency Fund: $430/$1000 |
| Result | Severity: orange, delays goal 29 days |
| Best choice | Redirect: goal bar animates to $519 |

This is the Alex Chen profile (`profile_id=alex`) — try the same purchase amount against Jordan or Sam and the insights, severity, and goal all come back different, since each profile has its own real data.

---

## Built By

**Founders:**

- Frontend and Infra Engineer: Ediale Odia
- Backend and AI Engineer: Aman Bollam

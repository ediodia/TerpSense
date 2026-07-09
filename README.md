# TerpSense

**Real time AI financial intervention agent.**

> "We don't track your money. We change your behavior."

TerpSense intercepts purchase decisions *before* they happen. When you are about to buy something, it analyzes your spending history, savings goals, and behavioral patterns, then intervenes with personalized, number grounded insights, better alternatives, and an interactive chatbot that helps users ask follow up questions before deciding.

Built for **Bitcamp 2026** using Capital One Nessie mock data, Azure OpenAI, and **LangGraph** for the AI agent workflow.

---

## The Problem

Young adults do not struggle with money because they lack charts or dashboards. They struggle because of **impulse**. Most finance apps explain mistakes *after* the money is already gone. TerpSense changes behavior in real time before the decision is finalized.

---

## Demo Flow

1. **Dashboard**: View your spending summary, savings goal, and recent transactions
2. **Check a Purchase**: Enter an amount, category, and merchant
3. **Intervention**: The LangGraph powered AI agent analyzes the purchase against your patterns and goal
4. **Ask TerpSense**: Use the chatbot on the intervention page to ask follow up questions like "Can I afford this?", "What should I do instead?", or "Help me save"
5. **Decide**: Redirect to savings, delay, find an alternative, or proceed anyway
6. **Outcome**: See your goal update in real time if you redirect

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
| GET | `/transactions` | Fetch recent transactions |
| GET | `/spending-summary` | Aggregated category spending |
| GET | `/goals` | Active savings goals |
| POST | `/analyze-purchase` | Run AI intervention analysis |
| POST | `/record-decision` | Log user decision, update goal |
| POST | `/reset-demo` | Reset session state for demo |
| POST | `/chat-purchase` | Chat with TerpSense about the current purchase decision |

---

## How the AI Works

The backend computes all numbers deterministically:

- **Severity score**: based on category overspend, purchase frequency, and goal conflict
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

The intervention page also includes an interactive chatbot powered by the same AI workflow. After the initial analysis, users can ask follow up questions about the purchase, such as whether they can afford it, what a better option would be, or how the decision affects their financial goals. This makes the experience more conversational and action oriented instead of stopping at a static recommendation.

A hardcoded contextual fallback runs if the AI call fails, so the demo never breaks.

---

## Demo Scenario

| Field | Value |
|---|---|
| Purchase | $89.00 at ASOS |
| Category | Clothing |
| Clothing spend this week | $143 (already) |
| Savings goal | Emergency Fund: $430/$1000 |
| Result | Severity: red, delays goal 29 days |
| Best choice | Redirect: goal bar animates to $519 |

---

## Built By

**Founders:**

- Frontend and Infra Engineer: Ediale Odia
- Backend and AI Engineer: Aman Bollam
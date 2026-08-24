from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db
from app.routers import analyze, auth, chat, financial_profile, goals, profiles, transactions

app = FastAPI(title="TerpSense API", version="1.0.0")


@app.on_event("startup")
def _on_startup():
    init_db()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, tags=["transactions"])
app.include_router(goals.router, tags=["goals"])
app.include_router(analyze.router, tags=["analyze"])
app.include_router(profiles.router, tags=["profiles"])
app.include_router(chat.router, tags=["chat"])
app.include_router(auth.router)
app.include_router(financial_profile.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.db_models import User
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class VerifyPasswordRequest(BaseModel):
    email: EmailStr
    password: str


class OAuthUpsertRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    provider: str


class AuthResponse(BaseModel):
    user_id: str
    email: str
    name: str
    token: str


def _issue(user: User) -> AuthResponse:
    return AuthResponse(user_id=user.id, email=user.email, name=user.name, token=create_access_token(user.id))


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        email=body.email.lower(),
        name=body.name.strip(),
        password_hash=hash_password(body.password),
        auth_provider="credentials",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue(user)


@router.post("/verify-password", response_model=AuthResponse)
def verify_password_route(body: VerifyPasswordRequest, db: Session = Depends(get_db)):
    """Called by NextAuth's Credentials provider — never called directly by the browser."""
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _issue(user)


@router.post("/oauth-upsert", response_model=AuthResponse)
def oauth_upsert(body: OAuthUpsertRequest, db: Session = Depends(get_db)):
    """Called by NextAuth's signIn callback for Google/Microsoft — get-or-create
    the backend User row so OAuth users have somewhere for financial data to live."""
    user = db.query(User).filter(User.email == body.email.lower()).first()
    if not user:
        user = User(email=body.email.lower(), name=body.name.strip(), auth_provider=body.provider)
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue(user)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User
from schemas import UserRegister, UserLogin, TokenResponse, UserOut
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Calculate subscription end date
    sub_end = None
    now = datetime.utcnow()
    if data.subscription_type == "monthly":
        sub_end = now + timedelta(days=30)
    elif data.subscription_type == "quarterly":
        sub_end = now + timedelta(days=90)
    elif data.subscription_type == "annual":
        sub_end = now + timedelta(days=365)

    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        subscription_type=data.subscription_type,
        subscription_end=sub_end,
        streak_count=0,
        last_login=now,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    now = datetime.utcnow()

    # Streak logic: if last login was yesterday → increment, if same day → keep, else → reset
    if user.last_login:
        delta = (now.date() - user.last_login.date()).days
        if delta == 1:
            user.streak_count += 1
        elif delta > 1:
            user.streak_count = 1
        # delta == 0 → same day, keep streak
    else:
        user.streak_count = 1

    user.last_login = now
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

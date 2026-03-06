from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User
from schemas import UserRegister, UserLogin, TokenResponse, UserOut
from auth import hash_password, verify_password, create_access_token, get_current_user
import random
import string
import emails as mailer
from limiter import limiter

def generate_referral_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Generate unique referral code for the new user
    new_referral_code = generate_referral_code()
    while db.query(User).filter(User.referral_code == new_referral_code).first():
        new_referral_code = generate_referral_code()

    # Handle incoming referral
    referred_by_id = None
    if data.referral_code:
        referrer = db.query(User).filter(User.referral_code == data.referral_code).first()
        if referrer:
            referred_by_id = referrer.id
            referrer.referral_reward_count = (referrer.referral_reward_count or 0) + 1
            # Cada referido da un 10% de descuento
            referrer.pending_10p_discounts = (referrer.pending_10p_discounts or 0) + 1
            # Cada 10 referidos da un mes gratis adicional
            if referrer.referral_reward_count % 10 == 0:
                referrer.free_months_accumulated = (referrer.free_months_accumulated or 0) + 1

    now = datetime.utcnow()

    # Always create as free — subscription must be activated via Stripe payment
    user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        subscription_type="free",
        subscription_end=None,
        streak_count=0,
        last_login=now,
        referral_code=new_referral_code,
        referred_by_id=referred_by_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    # Send welcome email (non-blocking)
    try:
        mailer.send_welcome(user.email, user.nombre)
    except Exception:
        pass
    return TokenResponse(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    # Case-insensitive lookup
    user = db.query(User).filter(User.email.ilike(data.email)).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
        
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    now = datetime.utcnow()

    # Streak logic: if last login was yesterday → increment, if same day → keep, else → reset
    if user.last_login:
        delta = (now.date() - user.last_login.date()).days
        if delta == 1:
            user.streak_count += 1
        elif delta > 1:
            # Check for streak protections (Anti-loss shield)
            if (user.streak_protections or 0) > 0:
                user.streak_protections -= 1
                # Streak is preserved, delta is ignored
            else:
                # Reset streak and apply XP penalty
                user.streak_count = 1
                user.xp = max(0, (user.xp or 0) - 100) # Penalización de 100 XP
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

"""
SM-2 Spaced Repetition for Flashcards.
Stores per-card progress per user and returns cards due for review.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import math

from database import get_db, FlashcardProgress, User
from auth import get_current_user

router = APIRouter(prefix="/flashcards/spaced", tags=["flashcards"])

class ReviewPayload(BaseModel):
    card_id: str
    quality: int  # 0=blackout, 1=wrong, 2=wrong-easy, 3=correct-hard, 4=correct, 5=perfect

class BulkProgressResponse(BaseModel):
    card_id: str
    interval: int
    ease_factor: float
    next_review: datetime
    repetitions: int

def _sm2(ease: float, interval: int, repetitions: int, quality: int):
    """SM-2 algorithm. Returns (new_ease, new_interval, new_reps)."""
    if quality >= 3:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval * ease)
        new_reps = repetitions + 1
    else:
        new_interval = 1
        new_reps = 0

    new_ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease = max(1.3, new_ease)
    return new_ease, new_interval, new_reps

@router.post("/review")
async def review_card(
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process a flashcard review with SM-2."""
    if payload.quality < 0 or payload.quality > 5:
        raise HTTPException(status_code=422, detail="quality must be 0-5")

    prog = db.query(FlashcardProgress).filter_by(
        user_id=current_user.id, card_id=payload.card_id
    ).first()

    if not prog:
        prog = FlashcardProgress(
            user_id=current_user.id,
            card_id=payload.card_id,
            ease_factor=2.5,
            interval=1,
            repetitions=0,
        )
        db.add(prog)

    new_ease, new_interval, new_reps = _sm2(
        prog.ease_factor, prog.interval, prog.repetitions, payload.quality
    )
    prog.ease_factor = new_ease
    prog.interval = new_interval
    prog.repetitions = new_reps
    prog.last_quality = payload.quality
    prog.next_review = datetime.utcnow() + timedelta(days=new_interval)
    prog.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prog)
    return {"card_id": payload.card_id, "interval": new_interval, "next_review": prog.next_review, "ease_factor": new_ease}

@router.get("/due")
async def get_due_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return list of card_ids due for review today."""
    due = db.query(FlashcardProgress).filter(
        FlashcardProgress.user_id == current_user.id,
        FlashcardProgress.next_review <= datetime.utcnow()
    ).all()
    return [{"card_id": p.card_id, "interval": p.interval, "repetitions": p.repetitions} for p in due]

@router.get("/progress")
async def get_all_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all card progress for the current user."""
    all_prog = db.query(FlashcardProgress).filter_by(user_id=current_user.id).all()
    return {p.card_id: {
        "interval": p.interval,
        "ease_factor": round(p.ease_factor, 3),
        "repetitions": p.repetitions,
        "next_review": p.next_review.isoformat(),
        "last_quality": p.last_quality,
    } for p in all_prog}

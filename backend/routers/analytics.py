"""
Analytics router — event tracking + admin stats endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from datetime import datetime, timedelta
from typing import Optional, List
import logging

from database import get_db, AnalyticsEvent, User
from auth import get_current_user, require_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# ── Track event (called from frontend) ───────────────────────────────────────
@router.post("/track")
async def track_event(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a frontend analytics event."""
    try:
        event = AnalyticsEvent(
            user_id=current_user.id,
            event_type=payload.get("event_type", "unknown"),
            resource_id=payload.get("resource_id"),
            resource_type=payload.get("resource_type"),
            extra=payload.get("extra"),
        )
        db.add(event)
        db.commit()
    except Exception as e:
        logger.warning(f"Analytics track error: {e}")
        db.rollback()
    return {"ok": True}

# ── Admin: overview stats ─────────────────────────────────────────────────────
@router.get("/admin/overview")
async def admin_overview(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)

    total_events = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.created_at >= since
    ).scalar()

    unique_users = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
        AnalyticsEvent.created_at >= since
    ).scalar()

    # Events per day (last N days)
    daily = db.execute(text("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= :since
        GROUP BY DATE(created_at)
        ORDER BY day ASC
    """), {"since": since}).fetchall()

    return {
        "total_events": total_events,
        "unique_users": unique_users,
        "daily_events": [{"day": str(r[0]), "count": r[1]} for r in daily],
        "period_days": days,
    }

# ── Admin: top abandoned labs ─────────────────────────────────────────────────
@router.get("/admin/labs/abandoned")
async def admin_labs_abandoned(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rows = db.query(
        AnalyticsEvent.resource_id,
        func.count(AnalyticsEvent.id).label("count"),
        func.avg(AnalyticsEvent.extra["step_idx"].as_float()).label("avg_step"),
    ).filter(
        AnalyticsEvent.event_type == "lab_step_abandoned"
    ).group_by(AnalyticsEvent.resource_id).order_by(desc("count")).limit(limit).all()

    return [{"lab_id": r[0], "abandons": r[1], "avg_step": round(r[2] or 0, 1)} for r in rows]

# ── Admin: most failed test questions ────────────────────────────────────────
@router.get("/admin/tests/failed-questions")
async def admin_failed_questions(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rows = db.query(
        AnalyticsEvent.resource_id,
        func.count(AnalyticsEvent.id).label("fail_count"),
    ).filter(
        AnalyticsEvent.event_type == "test_question_failed"
    ).group_by(AnalyticsEvent.resource_id).order_by(desc("fail_count")).limit(limit).all()

    return [{"question_id": r[0], "fail_count": r[1]} for r in rows]

# ── Admin: event type breakdown ───────────────────────────────────────────────
@router.get("/admin/events/breakdown")
async def admin_event_breakdown(
    days: int = Query(30),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        AnalyticsEvent.event_type,
        func.count(AnalyticsEvent.id).label("count")
    ).filter(
        AnalyticsEvent.created_at >= since
    ).group_by(AnalyticsEvent.event_type).order_by(desc("count")).all()

    return [{"event_type": r[0], "count": r[1]} for r in rows]

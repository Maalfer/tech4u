"""
Analytics router — event tracking + admin stats endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from datetime import datetime, timedelta
from typing import Optional, List, Any
from pydantic import BaseModel, field_validator
import logging

from database import get_db, AnalyticsEvent, User
from auth import get_current_user, require_admin
from services.cache_service import cache_service

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# ── Pydantic model for event tracking ────────────────────────────────────────
class TrackEventPayload(BaseModel):
    event_type: str
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None
    extra: Optional[Any] = None

    @field_validator('event_type')
    @classmethod
    def event_type_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError('event_type cannot be empty')
        return v[:80]  # cap length to prevent bloat

# ── Track event (called from frontend) ───────────────────────────────────────
@router.post("/track")
async def track_event(
    payload: TrackEventPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record a frontend analytics event."""
    try:
        event = AnalyticsEvent(
            user_id=current_user.id,
            event_type=payload.event_type,
            resource_id=payload.resource_id,
            resource_type=payload.resource_type,
            extra=payload.extra,
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
    cache_key = f"analytics_overview_{days}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    since = datetime.utcnow() - timedelta(days=days)

    total_events = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.created_at >= since
    ).scalar() or 0

    unique_users = db.query(func.count(func.distinct(AnalyticsEvent.user_id))).filter(
        AnalyticsEvent.created_at >= since
    ).scalar() or 0

    # Events per day
    daily_rows = db.execute(text("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= :since
        GROUP BY DATE(created_at)
        ORDER BY day ASC
    """), {"since": since}).fetchall()

    daily_events = [{"day": str(r[0]), "count": r[1]} for r in daily_rows]

    # Peak day
    peak_day_count = 0
    peak_day_name = "—"
    if daily_rows:
        peak = max(daily_rows, key=lambda r: r[1])
        peak_day_count = peak[1]
        try:
            peak_day_name = datetime.strptime(str(peak[0]), "%Y-%m-%d").strftime("%d %b")
        except Exception as e:
            logger.warning(f"Failed to parse peak day date {peak[0]}: {e}")
            peak_day_name = str(peak[0])

    # Daily average
    daily_avg = round(total_events / days, 1) if days > 0 else 0

    # Top event type
    top_event_row = db.query(
        AnalyticsEvent.event_type,
        func.count(AnalyticsEvent.id).label("cnt")
    ).filter(
        AnalyticsEvent.created_at >= since
    ).group_by(AnalyticsEvent.event_type).order_by(desc("cnt")).first()

    top_event_type = top_event_row[0] if top_event_row else "—"
    top_event_count = top_event_row[1] if top_event_row else 0

    result = {
        "total_events": total_events,
        "unique_users": unique_users,
        "daily_events": daily_events,
        "daily_avg": daily_avg,
        "peak_day_events": peak_day_count,
        "peak_day_name": peak_day_name,
        "top_event_type": top_event_type,
        "top_event_count": top_event_count,
        "period_days": days,
    }
    cache_service.set(cache_key, result, expire=300)  # 5 min TTL
    return result

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
    ).filter(
        AnalyticsEvent.event_type == "lab_step_abandoned"
    ).group_by(AnalyticsEvent.resource_id).order_by(desc("count")).limit(limit).all()

    return [{"lab_id": r[0], "abandons": r[1]} for r in rows]

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

# ── Admin: user growth (new registrations per day) ───────────────────────────
@router.get("/admin/users/growth")
async def admin_user_growth(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    cache_key = f"analytics_user_growth_{days}"
    cached = cache_service.get(cache_key)
    if cached:
        return cached

    since = datetime.utcnow() - timedelta(days=days)
    rows = db.execute(text("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM users
        WHERE created_at >= :since
        GROUP BY DATE(created_at)
        ORDER BY day ASC
    """), {"since": since}).fetchall()

    total_new = sum(r[1] for r in rows)
    result = {
        "daily": [{"day": str(r[0]), "count": r[1]} for r in rows],
        "total_new_users": total_new,
    }
    cache_service.set(cache_key, result, expire=300)
    return result

# ── Admin: top active users ───────────────────────────────────────────────────
@router.get("/admin/users/top-active")
async def admin_top_active_users(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        AnalyticsEvent.user_id,
        User.nombre,
        func.count(AnalyticsEvent.id).label("event_count"),
        func.max(AnalyticsEvent.created_at).label("last_seen"),
    ).join(User, User.id == AnalyticsEvent.user_id, isouter=True).filter(
        AnalyticsEvent.created_at >= since
    ).group_by(
        AnalyticsEvent.user_id, User.nombre
    ).order_by(desc("event_count")).limit(limit).all()

    return [
        {
            "user_id": r[0],
            "username": r[1] or f"Usuario #{r[0]}",
            "event_count": r[2],
            "last_seen": r[3].strftime("%d %b %H:%M") if r[3] else "—",
        }
        for r in rows
    ]

# ── Admin: test completion stats ─────────────────────────────────────────────
@router.get("/admin/tests/completions")
async def admin_test_completions(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)

    started = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_type == "test_started",
        AnalyticsEvent.created_at >= since
    ).scalar() or 0

    completed = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_type == "test_completed",
        AnalyticsEvent.created_at >= since
    ).scalar() or 0

    abandoned = db.query(func.count(AnalyticsEvent.id)).filter(
        AnalyticsEvent.event_type == "test_abandoned",
        AnalyticsEvent.created_at >= since
    ).scalar() or 0

    completion_rate = round((completed / started * 100), 1) if started > 0 else 0

    return {
        "started": started,
        "completed": completed,
        "abandoned": abandoned,
        "completion_rate": completion_rate,
    }

# ── Admin: page views ─────────────────────────────────────────────────────────
@router.get("/admin/pages/top")
async def admin_top_pages(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    since = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        AnalyticsEvent.resource_id,
        func.count(AnalyticsEvent.id).label("views"),
        func.count(func.distinct(AnalyticsEvent.user_id)).label("unique_views"),
    ).filter(
        AnalyticsEvent.event_type == "page_view",
        AnalyticsEvent.created_at >= since
    ).group_by(AnalyticsEvent.resource_id).order_by(desc("views")).limit(limit).all()

    return [{"page": r[0], "views": r[1], "unique_views": r[2]} for r in rows]

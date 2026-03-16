from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_optional_user, is_subscription_active, require_management
from services.permission_service import can_access_module, require_module_access
from database import User, get_db, TheorySubject, TheoryPost
from typing import Optional
import re

router = APIRouter(prefix="/teoria", tags=["Teoría"])

def make_slug(text: str) -> str:
    """Generate a URL-safe slug from text."""
    text = text.lower().strip()
    text = re.sub(r'[áàäâ]', 'a', text)
    text = re.sub(r'[éèëê]', 'e', text)
    text = re.sub(r'[íìïî]', 'i', text)
    text = re.sub(r'[óòöô]', 'o', text)
    text = re.sub(r'[úùüû]', 'u', text)
    text = re.sub(r'ñ', 'n', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def ensure_unique_slug(base_slug: str, db: Session, model, exclude_id: int = None) -> str:
    """Append a counter if the slug already exists."""
    slug = base_slug
    counter = 1
    while True:
        query = db.query(model).filter(model.slug == slug)
        if exclude_id:
            query = query.filter(model.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1

def _sort_posts(posts):
    """Sort posts by explicit order_index first, then by created_at ascending."""
    return sorted(posts, key=lambda p: (getattr(p, 'order_index', 0), p.created_at))

# ── Public endpoints (SEO-friendly — no auth required) ────────────────────────

@router.get("/subjects")
def list_subjects(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Public: lists all subjects. Works without login for SEO crawlers."""
    subjects = db.query(TheorySubject).order_by(TheorySubject.order_index).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "description": s.description,
            "icon": s.icon,
            "post_count": len(s.posts),
            "free_count": sum(1 for p in s.posts if getattr(p, 'is_free', False)),
        }
        for s in subjects
    ]

@router.get("/subjects/{slug}")
def get_subject(
    slug: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Public: lists posts for a subject with is_free flag. Works without login."""
    subject = db.query(TheorySubject).filter(TheorySubject.slug == slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {
        "id": subject.id,
        "name": subject.name,
        "slug": subject.slug,
        "description": subject.description,
        "icon": subject.icon,
        "posts": [
            {
                "id": p.id,
                "title": p.title,
                "slug": p.slug,
                "is_free": getattr(p, 'is_free', False),
                "order_index": getattr(p, 'order_index', 0),
                "created_at": p.created_at,
                "updated_at": p.updated_at,
            }
            for p in _sort_posts(subject.posts)
        ],
    }

@router.get("/subjects/{subject_slug}/posts/{post_slug}")
def get_post(
    subject_slug: str,
    post_slug: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Freemium post endpoint:
    - is_free=True  → full content to ANYONE (no login needed, great for SEO)
    - is_free=False + subscribed/staff → full content
    - is_free=False + no/free user     → metadata only, is_locked=True (paywall on client)
    Never returns 403 — the client decides what UI to show based on is_locked.
    """
    subject = db.query(TheorySubject).filter(TheorySubject.slug == subject_slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    post = db.query(TheoryPost).filter(
        TheoryPost.slug == post_slug,
        TheoryPost.subject_id == subject.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post_is_free = getattr(post, 'is_free', False)
    
    has_access = post_is_free
    if not has_access and current_user:
        from auth import require_subscription
        try:
            require_subscription(current_user)
            has_access = True
        except HTTPException:
            has_access = False

    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "is_free": post_is_free,
        "is_locked": not has_access,
        # Only include markdown_content when the user has access — server-side protection
        "markdown_content": post.markdown_content if has_access else None,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "subject": {"id": subject.id, "name": subject.name, "slug": subject.slug},
    }

@router.get("/recent")
def recent_posts(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
    limit: int = 5
):
    posts = db.query(TheoryPost).order_by(TheoryPost.updated_at.desc()).limit(limit).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "is_free": getattr(p, 'is_free', False),
            "subject_name": p.subject.name,
            "subject_slug": p.subject.slug,
            "updated_at": p.updated_at,
        }
        for p in posts
    ]

# ── Admin endpoints (admin + developer) ─────────────────────────────────────────

@router.post("/subjects")
def create_subject(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    base_slug = make_slug(data.get("name", ""))
    slug = ensure_unique_slug(base_slug, db, TheorySubject)
    subject = TheorySubject(
        name=data["name"],
        slug=slug,
        description=data.get("description", ""),
        icon=data.get("icon", "📚"),
        order_index=data.get("order_index", 0),
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "slug": subject.slug, "name": subject.name}

@router.put("/subjects/{slug}")
def update_subject(
    slug: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    subject = db.query(TheorySubject).filter(TheorySubject.slug == slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    if "name" in data:
        subject.name = data["name"]
        if "slug" not in data:
            subject.slug = ensure_unique_slug(make_slug(data["name"]), db, TheorySubject, subject.id)
    if "description" in data:
        subject.description = data["description"]
    if "icon" in data:
        subject.icon = data["icon"]
    if "order_index" in data:
        subject.order_index = data["order_index"]
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "slug": subject.slug, "name": subject.name}

@router.delete("/subjects/{slug}")
def delete_subject(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    subject = db.query(TheorySubject).filter(TheorySubject.slug == slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"ok": True}

@router.post("/subjects/{subject_slug}/posts")
def create_post(
    subject_slug: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    subject = db.query(TheorySubject).filter(TheorySubject.slug == subject_slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    base_slug = make_slug(data.get("title", ""))
    slug = ensure_unique_slug(base_slug, db, TheoryPost)
    post = TheoryPost(
        subject_id=subject.id,
        title=data["title"],
        slug=slug,
        markdown_content=data.get("markdown_content", ""),
        is_free=bool(data.get("is_free", False)),
        order_index=int(data.get("order_index", 0)),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "title": post.title, "is_free": post.is_free}

@router.put("/posts/{post_slug}")
def update_post(
    post_slug: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    post = db.query(TheoryPost).filter(TheoryPost.slug == post_slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if "title" in data:
        post.title = data["title"]
    if "markdown_content" in data:
        post.markdown_content = data["markdown_content"]
    if "is_free" in data:
        post.is_free = bool(data["is_free"])
    if "order_index" in data:
        post.order_index = int(data["order_index"])
    from datetime import datetime
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "title": post.title, "is_free": post.is_free}

@router.delete("/posts/{post_slug}")
def delete_post(
    post_slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_management)
):
    post = db.query(TheoryPost).filter(TheoryPost.slug == post_slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"ok": True}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, TheorySubject, TheoryPost
from auth import get_current_user
from database import User
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

# ── Public endpoints ──────────────────────────────────────────────────────────

@router.get("/subjects")
def list_subjects(db: Session = Depends(get_db)):
    subjects = db.query(TheorySubject).order_by(TheorySubject.order_index).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "description": s.description,
            "icon": s.icon,
            "post_count": len(s.posts),
        }
        for s in subjects
    ]

@router.get("/subjects/{slug}")
def get_subject(slug: str, db: Session = Depends(get_db)):
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
                "created_at": p.created_at,
                "updated_at": p.updated_at,
            }
            for p in sorted(subject.posts, key=lambda x: x.created_at, reverse=True)
        ],
    }

@router.get("/subjects/{subject_slug}/posts/{post_slug}")
def get_post(subject_slug: str, post_slug: str, db: Session = Depends(get_db)):
    subject = db.query(TheorySubject).filter(TheorySubject.slug == subject_slug).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    post = db.query(TheoryPost).filter(
        TheoryPost.slug == post_slug,
        TheoryPost.subject_id == subject.id
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "markdown_content": post.markdown_content,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "subject": {"id": subject.id, "name": subject.name, "slug": subject.slug},
    }

@router.get("/recent")
def recent_posts(db: Session = Depends(get_db), limit: int = 5):
    posts = db.query(TheoryPost).order_by(TheoryPost.updated_at.desc()).limit(limit).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "subject_name": p.subject.name,
            "subject_slug": p.subject.slug,
            "updated_at": p.updated_at,
        }
        for p in posts
    ]

# ── Admin endpoints ───────────────────────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

@router.post("/subjects")
def create_subject(
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
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
    _: User = Depends(require_admin)
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
    _: User = Depends(require_admin)
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
    _: User = Depends(require_admin)
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
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "title": post.title}

@router.put("/posts/{post_slug}")
def update_post(
    post_slug: str,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    post = db.query(TheoryPost).filter(TheoryPost.slug == post_slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if "title" in data:
        post.title = data["title"]
    if "markdown_content" in data:
        post.markdown_content = data["markdown_content"]
    from datetime import datetime
    post.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(post)
    return {"id": post.id, "slug": post.slug, "title": post.title}

@router.delete("/posts/{post_slug}")
def delete_post(
    post_slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    post = db.query(TheoryPost).filter(TheoryPost.slug == post_slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"ok": True}

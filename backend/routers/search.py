"""
search.py — Global search endpoint for Tech4U Academy.
Searches across labs, theory posts, skill paths, SQL exercises, and video courses.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from database import get_db, Lab, TheoryPost, TheorySubject, SkillPath, SQLExercise, Resource, VideoCourse
from auth import get_optional_user

router = APIRouter(prefix="/search", tags=["Búsqueda"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=2, max_length=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    """
    Global search across labs, theory, skill paths, SQL exercises, video courses and resources.
    Returns up to 5 results per category, sorted by relevance (title match first).
    """
    if not q or len(q.strip()) < 2:
        return {"results": [], "query": q, "total": 0}

    term = q.strip().lower()
    like_term = f"%{term}%"
    results = []

    # ── 1. Labs ──────────────────────────────────────────────────────────────
    try:
        labs = (
            db.query(Lab)
            .filter(
                Lab.is_active == True,
                or_(
                    func.lower(Lab.title).like(like_term),
                    func.lower(Lab.description).like(like_term),
                    func.lower(Lab.category).like(like_term),
                    func.lower(Lab.goal_description).like(like_term),
                ),
            )
            .order_by(Lab.order_index)
            .limit(5)
            .all()
        )
        for lab in labs:
            results.append({
                "type": "lab",
                "id": lab.id,
                "title": lab.title,
                "subtitle": lab.category or "Lab",
                "description": (lab.description or lab.goal_description or "")[:120],
                "badge": lab.difficulty or "medium",
                "badge_color": _difficulty_color(lab.difficulty),
                "url": f"/labs/{lab.id}",
                "icon": "terminal",
            })
    except Exception:
        pass

    # ── 2. Theory Posts ───────────────────────────────────────────────────────
    try:
        posts = (
            db.query(TheoryPost, TheorySubject)
            .join(TheorySubject, TheoryPost.subject_id == TheorySubject.id)
            .filter(
                or_(
                    func.lower(TheoryPost.title).like(like_term),
                    func.lower(TheorySubject.name).like(like_term),
                ),
            )
            .order_by(TheoryPost.order_index)
            .limit(5)
            .all()
        )
        for post, subject in posts:
            results.append({
                "type": "teoria",
                "id": post.id,
                "title": post.title,
                "subtitle": subject.name,
                "description": "",
                "badge": "Teoría",
                "badge_color": "blue",
                "url": f"/teoria/{subject.slug}/{post.slug}",
                "icon": "book",
            })
    except Exception:
        pass

    # ── 3. Skill Paths ────────────────────────────────────────────────────────
    try:
        paths = (
            db.query(SkillPath)
            .filter(
                SkillPath.is_active == True,
                or_(
                    func.lower(SkillPath.title).like(like_term),
                    func.lower(SkillPath.description).like(like_term),
                ),
            )
            .limit(4)
            .all()
        )
        for path in paths:
            results.append({
                "type": "skillpath",
                "id": path.id,
                "title": path.title,
                "subtitle": "Skill Path · Terminal",
                "description": (path.description or "")[:120],
                "badge": path.difficulty or "easy",
                "badge_color": _difficulty_color(path.difficulty),
                "url": "/labs",
                "icon": "path",
            })
    except Exception:
        pass

    # ── 4. SQL Exercises ──────────────────────────────────────────────────────
    try:
        sql_exercises = (
            db.query(SQLExercise)
            .filter(
                SQLExercise.is_active == True,
                or_(
                    func.lower(SQLExercise.title).like(like_term),
                    func.lower(SQLExercise.description).like(like_term),
                    func.lower(SQLExercise.category).like(like_term),
                ),
            )
            .limit(4)
            .all()
        )
        for ex in sql_exercises:
            results.append({
                "type": "sql",
                "id": ex.id,
                "title": ex.title,
                "subtitle": f"SQL · {ex.category}",
                "description": (ex.description or "")[:120],
                "badge": ex.difficulty or "basico",
                "badge_color": _difficulty_color(ex.difficulty),
                "url": "/sql-skills",
                "icon": "database",
            })
    except Exception:
        pass

    # ── 5. Video Courses ──────────────────────────────────────────────────────
    try:
        courses = (
            db.query(VideoCourse)
            .filter(
                or_(
                    func.lower(VideoCourse.title).like(like_term),
                    func.lower(VideoCourse.description).like(like_term),
                ),
            )
            .limit(3)
            .all()
        )
        for course in courses:
            results.append({
                "type": "course",
                "id": course.id,
                "title": course.title,
                "subtitle": "Curso de Vídeo",
                "description": (course.description or "")[:120],
                "badge": "Certificación",
                "badge_color": "lime",
                "url": f"/certificacion/{course.slug}" if course.slug else "/ciberseguridad",
                "icon": "video",
            })
    except Exception:
        pass

    # ── 6. Resources ──────────────────────────────────────────────────────────
    try:
        resources = (
            db.query(Resource)
            .filter(
                Resource.is_published == True,
                or_(
                    func.lower(Resource.title).like(like_term),
                    func.lower(Resource.description).like(like_term),
                    func.lower(Resource.subject).like(like_term),
                ),
            )
            .limit(3)
            .all()
        )
        for res in resources:
            results.append({
                "type": "resource",
                "id": res.id,
                "title": res.title,
                "subtitle": res.subject or "Recursos",
                "description": (res.description or "")[:120],
                "badge": "Recurso",
                "badge_color": "purple",
                "url": "/resources",
                "icon": "file",
            })
    except Exception:
        pass

    return {
        "results": results,
        "query": q,
        "total": len(results),
    }


def _difficulty_color(difficulty: str) -> str:
    mapping = {
        "easy": "green",
        "basico": "green",
        "beginner": "green",
        "medium": "yellow",
        "intermedio": "yellow",
        "intermediate": "yellow",
        "hard": "red",
        "avanzado": "red",
        "advanced": "red",
    }
    return mapping.get((difficulty or "").lower(), "slate")

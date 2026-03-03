from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from database import get_db, User, VideoCourse, VideoLesson, LessonProgress
from schemas import VideoCourseCreate, VideoCourseOut, VideoLessonCreate, VideoLessonOut
from auth import get_current_user, require_management, require_subscription

# ---------------------------------------------------------
# DOS ROUTERS: UNO PARA ADMIN/DOCENTE Y OTRO PARA USUARIOS
# ---------------------------------------------------------

router = APIRouter()

admin_router = APIRouter(
    prefix="/admin/video-courses",
    tags=["Admin - Video Courses"],
    dependencies=[Depends(require_management)]
)

public_router = APIRouter(
    prefix="/video-courses",
    tags=["Video Courses (Premium)"],
    dependencies=[Depends(require_subscription)]
)

# =========================================================
# RUTAS PÚBLICAS (Alumnos Premium + Admins)
# =========================================================

@public_router.get("/", response_model=List[VideoCourseOut])
def get_all_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtiene todos los cursos con el progreso del usuario calculado.
    """
    courses = db.query(VideoCourse).all()
    result = []
    
    for course in courses:
        total_lessons = len(course.lessons)
        progress = 0
        
        if total_lessons > 0:
            completed_count = db.query(LessonProgress).join(VideoLesson).filter(
                LessonProgress.user_id == current_user.id,
                VideoLesson.course_id == course.id
            ).count()
            progress = int((completed_count / total_lessons) * 100)
            
        course_out = VideoCourseOut.model_validate(course)
        course_out.progress_percentage = progress
        result.append(course_out)
        
    return result

@public_router.get("/{course_id}", response_model=VideoCourseOut)
def get_course_detail(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtiene un curso específico con sus lecciones preparadas y el estado de completado.
    """
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    course_out = VideoCourseOut.model_validate(course)
    
    # Obtener IDs de lecciones completadas por el usuario actual
    completed_lesson_ids = {
        lp.lesson_id for lp in db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id
        ).all()
    }
    
    # Actualizar estado is_completed en las lecciones devueltas
    for lesson in course_out.lessons:
        lesson.is_completed = lesson.id in completed_lesson_ids
        
    # Calcular progreso global del curso
    if len(course_out.lessons) > 0:
        completed = sum(1 for l in course_out.lessons if l.is_completed)
        course_out.progress_percentage = int((completed / len(course_out.lessons)) * 100)
    else:
        course_out.progress_percentage = 0
        
    # Ordenar lecciones
    course_out.lessons.sort(key=lambda x: x.order_index)
        
    return course_out

@public_router.post("/lessons/{lesson_id}/complete")
def toggle_lesson_complete(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Marca o desmarca una lección como completada para el usuario.
    """
    lesson = db.query(VideoLesson).filter(VideoLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
        
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    if progress:
        # Si ya estaba completada, la desmarcamos (toggle)
        db.delete(progress)
        db.commit()
        return {"status": "uncompleted"}
    else:
        new_progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(new_progress)
        db.commit()
        return {"status": "completed"}


# =========================================================
# RUTAS DE ADMINISTRACIÓN (Toda la lógica CRUD)
# =========================================================

# --- CURSOS ---

@admin_router.post("/", response_model=VideoCourseOut)
def create_course(data: VideoCourseCreate, db: Session = Depends(get_db)):
    new_course = VideoCourse(**data.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@admin_router.put("/{course_id}", response_model=VideoCourseOut)
def update_course(course_id: int, data: VideoCourseCreate, db: Session = Depends(get_db)):
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    for key, value in data.model_dump().items():
        setattr(course, key, value)
        
    db.commit()
    db.refresh(course)
    return course

@admin_router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    db.delete(course)
    db.commit()
    return {"detail": "Curso eliminado correctamente"}

# --- LECCIONES ---

@admin_router.post("/{course_id}/lessons", response_model=VideoLessonOut)
def create_lesson(course_id: int, data: VideoLessonCreate, db: Session = Depends(get_db)):
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso asociado no encontrado")
        
    new_lesson = VideoLesson(**data.model_dump(), course_id=course_id)
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@admin_router.put("/lessons/{lesson_id}", response_model=VideoLessonOut)
def update_lesson(lesson_id: int, data: VideoLessonCreate, db: Session = Depends(get_db)):
    lesson = db.query(VideoLesson).filter(VideoLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
        
    for key, value in data.model_dump().items():
        setattr(lesson, key, value)
        
    db.commit()
    db.refresh(lesson)
    return lesson

@admin_router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(VideoLesson).filter(VideoLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
        
    db.delete(lesson)
    db.commit()
    return {"detail": "Lección eliminada correctamente"}

# --- EXPORTAR ROUTERS ---
router.include_router(public_router)
router.include_router(admin_router)

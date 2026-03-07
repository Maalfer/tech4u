from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List, Optional
import os, uuid, shutil
import stripe

from database import get_db, User, VideoCourse, VideoLesson, LessonProgress, UserCoursePurchase
from schemas import VideoCourseCreate, VideoCourseOut, VideoLessonCreate, VideoLessonOut, UserCoursePurchaseOut
from auth import get_current_user, require_management, require_subscription

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

VIDEOS_DIR = "static/videos"

# ---------------------------------------------------------
# DOS ROUTERS: UNO PARA ADMIN/DOCENTE Y OTRO PARA USUARIOS
# ---------------------------------------------------------

router = APIRouter()

admin_router = APIRouter(
    prefix="/admin/video-courses",
    tags=["Admin - Video Courses"],
    dependencies=[Depends(require_management)]
)

# Shop router - no subscription required, just logged in
shop_router = APIRouter(
    prefix="/video-courses",
    tags=["Academy Shop"],
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
    Obtiene todos los cursos (no-shop) con el progreso del usuario calculado.
    """
    courses = db.query(VideoCourse).filter(VideoCourse.is_shop_course == False).all()

    # Single bulk query for all course progress instead of N+1
    progress_counts = db.query(
        VideoLesson.course_id,
        func.count(LessonProgress.id).label('completed')
    ).join(LessonProgress, LessonProgress.lesson_id == VideoLesson.id).filter(
        LessonProgress.user_id == current_user.id
    ).group_by(VideoLesson.course_id).all()

    progress_map = {course_id: completed for course_id, completed in progress_counts}

    result = []
    for course in courses:
        total_lessons = len(course.lessons)
        progress = 0

        if total_lessons > 0:
            completed_count = progress_map.get(course.id, 0)
            progress = int((completed_count / total_lessons) * 100)

        course_out = VideoCourseOut.model_validate(course)
        course_out.progress_percentage = progress
        result.append(course_out)

    return result

@public_router.get("/{course_id}", response_model=VideoCourseOut)
def get_course_detail(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Obtiene un curso específico con sus lecciones preparadas y el estado de completado.
    Verifica propiedad si es un curso de tienda.
    """
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
        
    # IDOR Fix: Si es un curso de tienda, verificar que el usuario lo haya comprado
    # Los administradores/docentes saltan esta comprobación por el middleware de require_subscription
    # pero aquí necesitamos ser más granulares.
    if course.is_shop_course:
        is_owner = db.query(UserCoursePurchase).filter(
            UserCoursePurchase.user_id == current_user.id,
            UserCoursePurchase.course_id == course_id
        ).first()
        if not is_owner and current_user.role not in ["admin", "docente", "developer"]:
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso de la tienda")

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
    Verifica que el usuario tenga acceso al curso al que pertenece la lección.
    """
    lesson = db.query(VideoLesson).filter(VideoLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    
    # IDOR Fix: Verificar acceso al curso
    course = lesson.course
    if course.is_shop_course:
        is_owner = db.query(UserCoursePurchase).filter(
            UserCoursePurchase.user_id == current_user.id,
            UserCoursePurchase.course_id == course.id
        ).first()
        if not is_owner and current_user.role not in ["admin", "docente", "developer"]:
            raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    # else: public_router ya está protegido por require_subscription

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
# RUTAS DE ACADEMIA SHOP (sin restricción de suscripción)
# =========================================================

@shop_router.get("/shop", response_model=List[VideoCourseOut])
def get_shop_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Lista todos los cursos de la tienda activos con estado de compra por usuario."""
    courses = db.query(VideoCourse).filter(
        VideoCourse.is_shop_course.is_(True),
        VideoCourse.is_active.is_(True)
    ).all()

    # IDs de cursos que este usuario ya ha comprado
    purchased_ids = {
        p.course_id for p in db.query(UserCoursePurchase)
            .filter(UserCoursePurchase.user_id == current_user.id).all()
    }

    # Single bulk query for all course progress instead of N+1
    progress_counts = db.query(
        VideoLesson.course_id,
        func.count(LessonProgress.id).label('completed')
    ).join(LessonProgress, LessonProgress.lesson_id == VideoLesson.id).filter(
        LessonProgress.user_id == current_user.id
    ).group_by(VideoLesson.course_id).all()

    progress_map = {course_id: completed for course_id, completed in progress_counts}

    result = []
    for course in courses:
        total_lessons = len(course.lessons)
        progress = 0
        if total_lessons > 0:
            completed_count = progress_map.get(course.id, 0)
            progress = int((completed_count / total_lessons) * 100)

        course_out = VideoCourseOut.model_validate(course)
        course_out.progress_percentage = progress
        course_out.is_purchased = course.id in purchased_ids
        result.append(course_out)

    return result


@shop_router.post("/{course_id}/create-checkout-session")
def create_course_checkout_session(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crea una sesión de Stripe Checkout para comprar un curso vitalicio."""
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id, VideoCourse.is_shop_course.is_(True)).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado en la tienda")
    
    # Verificar si ya lo tiene
    already_owned = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.course_id == course_id
    ).first()
    if already_owned:
        raise HTTPException(status_code=400, detail="Ya posees este curso")

    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe no configurado")

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "unit_amount": int(course.price * 100),
                    "product_data": {
                        "name": course.title,
                        "description": "Acceso vitalicio al curso",
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            client_reference_id=str(current_user.id),
            metadata={
                "type": "course_purchase",
                "course_id": str(course_id),
                "user_id": str(current_user.id)
            },
            success_url=f"{FRONTEND_URL}/watch/{course_id}?purchase_success=true",
            cancel_url=f"{FRONTEND_URL}/shop",
            customer_email=current_user.email,
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@shop_router.post("/{course_id}/purchase", response_model=UserCoursePurchaseOut)
def purchase_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compra vitalicia de un curso de la tienda (sin pasarela de pago real)."""
    course = db.query(VideoCourse).filter(
        VideoCourse.id == course_id,
        VideoCourse.is_shop_course == True
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso de tienda no encontrado")

    # Comprobar si ya lo tiene
    existing = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.course_id == course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya posees este curso")

    purchase = UserCoursePurchase(
        user_id=current_user.id,
        course_id=course_id,
        amount_paid=course.price
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    return purchase


@shop_router.get("/{course_id}/shop-detail", response_model=VideoCourseOut)
def get_shop_course_detail(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene detalle de un curso de tienda - siempre accesible pero lecciones bloqueadas si no comprado."""
    course = db.query(VideoCourse).filter(
        VideoCourse.id == course_id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    purchased = db.query(UserCoursePurchase).filter(
        UserCoursePurchase.user_id == current_user.id,
        UserCoursePurchase.course_id == course_id
    ).first()

    course_out = VideoCourseOut.model_validate(course)
    course_out.is_purchased = bool(purchased)

    if purchased:
        completed_lesson_ids = {
            lp.lesson_id for lp in db.query(LessonProgress).filter(
                LessonProgress.user_id == current_user.id
            ).all()
        }
        for lesson in course_out.lessons:
            lesson.is_completed = lesson.id in completed_lesson_ids
        if len(course_out.lessons) > 0:
            completed = sum(1 for l in course_out.lessons if l.is_completed)
            course_out.progress_percentage = int((completed / len(course_out.lessons)) * 100)

    course_out.lessons.sort(key=lambda x: x.order_index)
    return course_out


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


@admin_router.post("/{course_id}/lessons/upload", response_model=VideoLessonOut)
async def upload_lesson_video(
    course_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    order_index: int = Form(0),
    video: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a self-hosted video file for an Academy Shop lesson."""
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Validate file type
    allowed = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
    if video.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Tipo de archivo no permitido: {video.content_type}")

    # Save file with unique name
    ext = os.path.splitext(video.filename)[1] if video.filename else ".mp4"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(VIDEOS_DIR, filename)
    os.makedirs(VIDEOS_DIR, exist_ok=True)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    file_url = f"/static/videos/{filename}"

    new_lesson = VideoLesson(
        course_id=course_id,
        title=title,
        description=description,
        video_file_path=file_url,
        youtube_url=None,
        order_index=order_index,
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson


@admin_router.delete("/lessons/{lesson_id}/video")
def delete_lesson_video(lesson_id: int, db: Session = Depends(get_db)):
    """Delete only the video file of a lesson (keeps lesson record)."""
    lesson = db.query(VideoLesson).filter(VideoLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada")
    if lesson.video_file_path:
        path = lesson.video_file_path.lstrip("/")
        if os.path.exists(path):
            os.remove(path)
        lesson.video_file_path = None
        db.commit()
    return {"detail": "Vídeo eliminado"}

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

# --- GESTIÓN DE TIENDA ---

@admin_router.get("/all", response_model=List[VideoCourseOut])
def admin_list_all_courses(db: Session = Depends(get_db)):
    """(Admin) Lista todos los cursos incluyendo desactivados y de tienda."""
    return db.query(VideoCourse).order_by(VideoCourse.created_at.desc()).all()


@admin_router.patch("/{course_id}/toggle-active")
def toggle_course_active(course_id: int, db: Session = Depends(get_db)):
    """(Admin) Activa o desactiva un curso."""
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    course.is_active = not course.is_active
    db.commit()
    return {"id": course.id, "is_active": course.is_active}


@admin_router.patch("/{course_id}/toggle-shop")
def toggle_course_shop(course_id: int, db: Session = Depends(get_db)):
    """(Admin) Mueve un curso a la tienda o lo saca."""
    course = db.query(VideoCourse).filter(VideoCourse.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    course.is_shop_course = not course.is_shop_course
    db.commit()
    return {"id": course.id, "is_shop_course": course.is_shop_course}

# --- EXPORTAR ROUTERS ---
# Ponemos shop_router antes que public_router para evitar que require_subscription
# de public_router interfiera con las rutas de la tienda si el usuario no tiene plan.
router.include_router(shop_router)
router.include_router(public_router)
router.include_router(admin_router)

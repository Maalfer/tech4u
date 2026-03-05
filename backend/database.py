from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tech4u.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELOS DE USUARIO Y PROGRESO ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    streak_count = Column(Integer, default=0)
    months_subscribed = Column(Integer, default=0) 
    subscription_type = Column(String, default="free") 
    last_login = Column(DateTime, nullable=True)
    subscription_start = Column(DateTime, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    auto_renew = Column(Boolean, default=True)
    role = Column(String, default="alumno") 
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_protections = Column(Integer, default=0) # Bloqueos de racha (Suscrip. Anual)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Referidos
    referral_code = Column(String, unique=True, index=True, nullable=True)
    referred_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_reward_count = Column(Integer, default=0) # Contador total de invitados
    pending_10p_discounts = Column(Integer, default=0) # Cupones de 10% listos para usar
    free_months_accumulated = Column(Integer, default=0) # Meses gratis por cada 10 invitados

    # Relaciones
    referrals = relationship("User", backref="referrer", remote_side=[id])
    errors = relationship("UserError", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    suggestions = relationship("QuestionSuggestion", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")


class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    total_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    time_invested_minutes = Column(Float, default=0.0)
    user = relationship("User", back_populates="progress")

# --- MODELOS DE CONTENIDO ---

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True, nullable=False)
    text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    approved = Column(Boolean, default=True) # Campo añadido para control docente

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String, default="pdf")
    url = Column(String, nullable=True)
    requires_subscription = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)  # Borrador hasta que admin lo publique

# --- MODELOS DE SOPORTE Y GESTIÓN ---

class UserError(Base):
    __tablename__ = "user_errors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    fail_count = Column(Integer, default=1)
    last_failed = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="errors")
    question = relationship("Question")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False) 
    description = Column(Text, nullable=False)
    status = Column(String, default="pendiente") # "pendiente" | "resuelto"
    admin_reply = Column(Text, nullable=True) # Legacy support
    replied_at = Column(DateTime, nullable=True) # Legacy support
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    sender_role = Column(String, nullable=False) # "admin" o "alumno"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ticket = relationship("Ticket", back_populates="messages")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class QuestionSuggestion(Base):
    __tablename__ = "question_suggestions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    status = Column(String, default="pendiente") # pendiente | aprobada | descartada
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="suggestions")

class AcademyStats(Base):
    __tablename__ = "academy_stats"
    id = Column(Integer, primary_key=True, index=True)
    total_revenue = Column(Float, default=0.0)
    monthly_target = Column(Float, default=5000.0)

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    max_uses = Column(Integer, default=1)
    current_uses = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Lock to one user
    created_at = Column(DateTime, default=datetime.utcnow)

class AnnouncementRead(Base):
    """Tracks which users have read which announcements (for unread popup)."""
    __tablename__ = "announcement_reads"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    announcement_id = Column(Integer, ForeignKey("announcements.id"), nullable=False)
    read_at = Column(DateTime, default=datetime.utcnow)

# --- MODELOS DE CURSOS EN VÍDEO ---

class VideoCourse(Base):
    __tablename__ = "video_courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    # Shop fields
    price = Column(Float, nullable=True)           # None = free for subscribers, >0 = one-time purchase
    is_shop_course = Column(Boolean, default=False) # If True, appears in Academy Shop and requires purchase
    is_active = Column(Boolean, default=True)       # Admin can disable a course to hide it from students
    created_at = Column(DateTime, default=datetime.utcnow)
    
    lessons = relationship("VideoLesson", back_populates="course", cascade="all, delete-orphan")
    purchases = relationship("UserCoursePurchase", back_populates="course", cascade="all, delete-orphan")

class VideoLesson(Base):
    __tablename__ = "video_lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("video_courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    youtube_url = Column(String, nullable=True)   # For YT Help courses
    video_file_path = Column(String, nullable=True) # For Shop courses (self-hosted)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("VideoCourse", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("video_lessons.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    lesson = relationship("VideoLesson", back_populates="progress")

class UserCoursePurchase(Base):
    """Lifetime purchase of a shop course by a user."""
    __tablename__ = "user_course_purchases"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("video_courses.id"), nullable=False)
    purchased_at = Column(DateTime, default=datetime.utcnow)
    amount_paid = Column(Float, nullable=True)

    user = relationship("User")
    course = relationship("VideoCourse", back_populates="purchases")

# --- HISTORIAL DE TESTS ---

class TestSession(Base):
    __tablename__ = "test_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    mode = Column(String, default="normal")          # normal | exam | errors
    total = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    xp_gained = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    completed_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

# --- INVENTARIO RPG ---

class UserItem(Base):
    """Items que el usuario ha conseguido aleatoriamente al pasar exámenes."""
    __tablename__ = "user_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_key = Column(String, nullable=False)       # Clave única del item del catálogo
    item_name = Column(String, nullable=False)      # Nombre display del item
    item_emoji = Column(String, nullable=False)     # Emoji del item
    item_rarity = Column(String, default="común")   # común | raro | épico | legendario
    item_description = Column(Text, nullable=True)  # Descripción del item
    obtained_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True) # Emoji o URL
    rarity = Column(String, default="común")
    xp_bonus = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    obtained_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

# --- TRANSACCIONES PAYPAL ---

class PayPalOrder(Base):
    __tablename__ = "paypal_orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    paypal_order_id = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="CREATED") # CREATED, CAPTURED, FAILED
    amount = Column(Float, nullable=False)
    subscription_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


# --- SKILL LABS ---

class SkillLabExercise(Base):
    __tablename__ = "skill_lab_exercises"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True, nullable=False)
    sentence_template = Column(String, nullable=False) 
    correct_answers = Column(String, nullable=False) # JSON list e.g. '["sshd", "rsyslog"]'
    distractors = Column(String, nullable=False) # JSON list e.g. '["httpd", "systemd"]'
    explanation = Column(String, nullable=True) 
    difficulty = Column(String, default="medium")
    approved = Column(Boolean, default=True)

class Lab(Base):
    """Terminal Simulator Labs for ASIR/Sistemas."""
    __tablename__ = "terminal_labs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    docker_image = Column(String, default="ubuntu:22.04") # Base image for the lab
    scenario_setup = Column(Text, nullable=True) # JSON describing the initial VM/State
    goal_description = Column(Text, nullable=False)
    validation_command = Column(String, nullable=True) # Command to run for checking success
    expected_result = Column(String, nullable=True) # Expected output from validation command
    difficulty = Column(String, default="medium") # easy | medium | hard
    category = Column(String, default="Linux") # Linux | Redes | Seguridad
    time_limit = Column(Integer, default=30) # Time limit in minutes
    xp_reward = Column(Integer, default=150)
    is_active = Column(Boolean, default=True)
    step_by_step_guide = Column(Text, nullable=True) # Markdown guide for the student
    expected_flag = Column(String, nullable=True) # For CTF-style labs (flag{...})
    created_at = Column(DateTime, default=datetime.utcnow)

class UserLabCompletion(Base):
    """Tracks which users have successfully completed which labs."""
    __tablename__ = "user_lab_completions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lab_id = Column(Integer, ForeignKey("terminal_labs.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    xp_gained = Column(Integer, default=0)

    user = relationship("User")
    lab = relationship("Lab")

# --- UTILIDADES ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
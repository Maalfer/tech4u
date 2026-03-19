from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Index, JSON, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tech4u.db")

# Only SQLite needs check_same_thread: False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# ── Connection pool (producción PostgreSQL) ───────────────────────────────────
# pool_size: conexiones persistentes abiertas
# max_overflow: conexiones extra permitidas bajo carga puntual
# pool_pre_ping: verifica conexión antes de usarla (evita "connection closed" tras idle)
# pool_recycle: renueva conexiones cada 30 min (evita timeout del servidor)
IS_POSTGRES = DATABASE_URL.startswith("postgresql")
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_size=10          if IS_POSTGRES else 5,
    max_overflow=20       if IS_POSTGRES else 0,
    pool_pre_ping=True,
    pool_recycle=1800,    # 30 minutos
)
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
    
    # Anti-Farming & Limits
    last_xp_date = Column(DateTime, nullable=True)
    xp_today = Column(Integer, default=0)

    # Password Reset
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    # SEC-05 FIX: versión de token para revocación inmediata de sesiones
    # Al incrementar este valor, todos los tokens anteriores quedan invalidados
    token_version = Column(Integer, default=0, nullable=False)

    # Onboarding
    ciclo = Column(String, nullable=True)           # 'ASIR' | 'DAM' | 'DAW' | 'SMR'
    onboarding_completed = Column(Boolean, default=False)

    # Relaciones
    errors = relationship("UserError", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    suggestions = relationship("QuestionSuggestion", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    skill_lab_sessions = relationship("SkillLabSession", back_populates="user")

    def get_next_level_xp(self):
        """
        XP necesaria para subir desde el nivel actual al siguiente.
        Curva progresiva en 4 tramos:
          Niveles  1-5 :   800 XP  (inicio rápido, enganchante)
          Niveles  6-10:  1500 XP  (ritmo medio)
          Niveles 11-15:  2500 XP  (esfuerzo serio)
          Niveles 16-19:  4000 XP  (endgame, sólo los mejores)
        Total acumulado para nivel 20: 40 000 XP
        """
        if self.level <= 5:  return 800
        if self.level <= 10: return 1500
        if self.level <= 15: return 2500
        if self.level <= 19: return 4000
        return 99999  # nivel 20 es el tope

    def add_xp(self, amount: int):
        """
        Suma XP y gestiona subidas de nivel de forma centralizada.
        self.xp almacena el XP DENTRO del nivel actual (no acumulado total).
        """
        if amount <= 0:
            return False

        # --- LÍMITE XP DIARIO (5000 XP) ---
        now = datetime.utcnow()
        today = now.date()
        
        if self.last_xp_date and self.last_xp_date.date() == today:
            if (self.xp_today or 0) >= 5000:
                return False  # Límite diario alcanzado
            if (self.xp_today or 0) + amount > 5000:
                amount = 5000 - (self.xp_today or 0)
        else:
            # Nuevo día o primer XP
            self.xp_today = 0
            self.last_xp_date = now

        self.xp_today = (self.xp_today or 0) + amount
        # ---------------------------------

        self.xp = max(0, (self.xp or 0) + amount)
        leveled_up = False

        while self.level < 20:
            needed = self.get_next_level_xp()
            if self.xp >= needed:
                self.xp -= needed
                self.level += 1
                leveled_up = True
            else:
                break

        # Tope duro en nivel 20
        if self.level >= 20:
            self.level = 20

        return leveled_up

    def get_prev_level_xp(self):
        """Devuelve el XP máximo del nivel anterior para de-leveling."""
        if self.level <= 1: return 0
        if self.level <= 6: return 800
        if self.level <= 11: return 1500
        if self.level <= 16: return 2500
        return 4000

    def remove_xp(self, amount: int):
        """
        Resta XP y gestiona bajadas de nivel de forma centralizada.
        Penalización que trasciende el nivel actual.
        """
        if amount <= 0:
            return False
            
        self.xp = (self.xp or 0) - amount
        leveled_down = False
        
        while self.xp < 0 and self.level > 1:
            self.level -= 1
            prev_max = self.get_prev_level_xp()
            self.xp += prev_max
            leveled_down = True
            
        if self.xp < 0:
            self.xp = 0
            
        return leveled_down

# --- TRANSACCIONES PAYPAL ---

class PayPalOrder(Base):
    __tablename__ = "paypal_orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
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


class NetLabScenario(Base):
    """NetLab interactive Cisco CLI simulator scenarios."""
    __tablename__ = "netlabs_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, default="medium", index=True)  # easy | medium | hard
    subject = Column(String, default="redes", index=True, nullable=False)
    category = Column(String, default="Networking")  # Routing | Switching | QoS | Addressing | etc.
    points = Column(Integer, default=100)
    estimated_time = Column(String, nullable=True)  # e.g. "15–20 min"
    topology = Column(Text, nullable=False)  # JSON: nodes, links, viewBox
    symptom = Column(Text, nullable=False)  # Problem description in Spanish
    commands = Column(Text, nullable=False)  # JSON: deviceId -> [{cmd, output, revealsFault}]
    fault = Column(Text, nullable=False)  # JSON: {deviceId, description, fixCommand}
    diagnosis_options = Column(Text, nullable=False)  # JSON: [{id, text, correct}]
    solution_explanation = Column(Text, nullable=False)  # Educational explanation in Spanish
    hints = Column(Text, nullable=False)  # JSON: array of hint strings in Spanish
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String, nullable=False)
    total_answered = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    time_invested_minutes = Column(Float, default=0.0)
    user = relationship("User", back_populates="progress")
    __table_args__ = (Index("ix_user_progress_user_subject", "user_id", "subject"),)

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
    approved = Column(Boolean, default=True)


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    fail_count = Column(Integer, default=1)
    last_failed = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="errors")
    question = relationship("Question")
    __table_args__ = (Index("ix_user_errors_user_question", "user_id", "question_id"),)

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
    # SEC-03 FIX: reserva atómica de usos pendientes de confirmación por Stripe
    # current_uses + pending_uses >= max_uses → cupo agotado
    pending_uses = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Lock to one user
    # Nuevos campos
    description = Column(String, nullable=True)                # Nota interna / propósito
    expires_at = Column(DateTime, nullable=True)               # Expiración opcional
    applicable_plans = Column(String, default="all")           # "all" | "monthly" | "quarterly" | "annual"
    created_at = Column(DateTime, default=datetime.utcnow)

class ProcessedStripeEvent(Base):
    """SEC: Idempotencia de webhooks de Stripe. Evita doble proceso si Stripe reintenta."""
    __tablename__ = "processed_stripe_events"
    id              = Column(Integer, primary_key=True, index=True)
    stripe_event_id = Column(String, unique=True, index=True, nullable=False)
    event_type      = Column(String, nullable=True)
    processed_at    = Column(DateTime, default=datetime.utcnow)

class UserCouponUsage(Base):
    """Registra qué usuario ha usado qué cupón — evita reusos fraudulentos."""
    __tablename__ = "user_coupon_usage"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    coupon_id  = Column(Integer, ForeignKey("coupons.id"), nullable=False, index=True)
    used_at    = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (
        UniqueConstraint("user_id", "coupon_id", name="uq_user_coupon"),
    )

class AnnouncementRead(Base):
    """Tracks which users have read which announcements (for unread popup)."""
    __tablename__ = "announcement_reads"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    announcement_id = Column(Integer, ForeignKey("announcements.id"), nullable=False, index=True)
    read_at = Column(DateTime, default=datetime.utcnow)

# --- MODELOS DE CURSOS EN VÍDEO ---

class VideoCourse(Base):
    __tablename__ = "video_courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=True)  # e.g. "ejptv2" for URL routing
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
    section_title = Column(String, nullable=True)  # Section grouping label (e.g. "Sección 1: Introducción")
    is_quiz = Column(Boolean, default=False)        # True for quiz/assessment entries
    created_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("VideoCourse", back_populates="lessons")
    progress = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")
    materials = relationship("LessonMaterial", back_populates="lesson", cascade="all, delete-orphan")

class LessonMaterial(Base):
    """Material adicional adjunto a una lección (PDFs, slides, scripts, etc.)"""
    __tablename__ = "lesson_materials"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("video_lessons.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # /static/materials/<uuid>.<ext>
    file_type = Column(String, nullable=True)   # "pdf", "zip", "txt", etc.
    file_size = Column(Integer, nullable=True)  # bytes
    created_at = Column(DateTime, default=datetime.utcnow)

    lesson = relationship("VideoLesson", back_populates="materials")

class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("video_lessons.id"), nullable=False, index=True)
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String, nullable=False, index=True)
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False, index=True)
    obtained_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")
    __table_args__ = (Index("ix_user_achievements_user_ach", "user_id", "achievement_id"),)

# --- SISTEMA DE REFERIDOS ---

class Referral(Base):
    """
    Auditoría completa de cada relación referido→referidor.
    Una entrada por usuario invitado (referred_id es único).
    """
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)

    # Quién invitó y quién fue invitado
    referrer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    referred_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Estado del ciclo de vida
    # pending   → el invitado se registró con el código pero aún no ha pagado
    # confirmed → el invitado completó un pago → el referidor recibe la recompensa
    # rejected  → rechazado manualmente por admin
    # fraud     → detección automática o manual de fraude
    status = Column(String, default="pending", index=True)

    # Campos anti-fraude
    ip_address = Column(String, nullable=True)           # IP del invitado en el momento del registro
    device_fingerprint = Column(String, nullable=True)   # Huella del navegador (enviada por el frontend)

    # Timeline
    created_at = Column(DateTime, default=datetime.utcnow)   # Cuando se usó el código de referido
    confirmed_at = Column(DateTime, nullable=True)            # Cuando se confirmó el pago
    rejection_reason = Column(String, nullable=True)          # Motivo de rechazo/fraude

    # Relaciones
    referrer = relationship("User", foreign_keys=[referrer_id])
    referred = relationship("User", foreign_keys=[referred_id])



class SkillPath(Base):
    """Hierarchical top-level paths (e.g. Linux Fundamentals, Networking)."""
    __tablename__ = "skill_paths"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="easy")
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    modules = relationship("Module", back_populates="skill_path", cascade="all, delete-orphan")

class Module(Base):
    """Modules within a Skill Path (e.g. L1 Navigation, L2 Users)."""
    __tablename__ = "terminal_modules"
    id = Column(Integer, primary_key=True, index=True)
    skill_path_id = Column(Integer, ForeignKey("skill_paths.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    requires_validation = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    skill_path = relationship("SkillPath", back_populates="modules")
    labs = relationship("Lab", back_populates="module", cascade="all, delete-orphan")

class Lab(Base):
    """Terminal Simulator Labs for ASIR/Sistemas."""
    __tablename__ = "terminal_labs"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("terminal_modules.id"), nullable=True)
    title = Column(String, nullable=False)
    module_name = Column(String, nullable=True) # Legacy support (deprecated)
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
    is_free = Column(Boolean, default=False)         # Free preview — accessible without subscription
    step_by_step_guide = Column(Text, nullable=True) # Markdown guide for the student
    validation_rules = Column(Text, nullable=True) # JSON with multiple check rules
    expected_flag = Column(String, nullable=True) # For CTF-style labs (flag{...})
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="labs")
    challenges = relationship("Challenge", back_populates="lab", cascade="all, delete-orphan")

class UserLabCompletion(Base):
    """Tracks which users have successfully completed which labs."""
    __tablename__ = "user_lab_completions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lab_id = Column(Integer, ForeignKey("terminal_labs.id"), nullable=False, index=True)
    completed_at = Column(DateTime, default=datetime.utcnow)
    xp_gained = Column(Integer, default=0)

    user = relationship("User")
    lab = relationship("Lab")
    __table_args__ = (Index("ix_user_lab_completions_user_lab", "user_id", "lab_id"),)

class UserChallengeCompletion(Base):
    """Tracks which users have completed specific challenges within a lab."""
    __tablename__ = "user_challenge_completions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lab_id = Column(Integer, ForeignKey("terminal_labs.id"), nullable=False, index=True)
    challenge_id = Column(String, nullable=False) # ID of the challenge inside the JSON
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    lab = relationship("Lab")

class Challenge(Base):
    """Specific challenges within a Terminal Lab."""
    __tablename__ = "terminal_challenges"
    id = Column(String, primary_key=True, index=True) # e.g. "L1_C1"
    lab_id = Column(Integer, ForeignKey("terminal_labs.id"), primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    validation_type = Column(String, nullable=False) # directory_listing_exact, path_exact, etc.
    validation_value = Column(Text, nullable=True)
    validation_extra = Column(Text, nullable=True) # For additional context like "which directory to ls"
    order_index = Column(Integer, default=0)
    xp = Column(Integer, default=10)
    hints = Column(Text, nullable=True) # pipe-separated hints
    
    lab = relationship("Lab", back_populates="challenges")

# --- UTILIDADES ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- TEORÍA / TEMARIO ---

class TheorySubject(Base):
    __tablename__ = "theory_subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="📚")
    order_index = Column(Integer, default=0)
    posts = relationship("TheoryPost", back_populates="subject", cascade="all, delete-orphan")

class TheoryPost(Base):
    __tablename__ = "theory_posts"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("theory_subjects.id"), nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    markdown_content = Column(Text, default="")
    is_free = Column(Boolean, default=False)        # Free preview — no subscription needed
    order_index = Column(Integer, default=0)        # Explicit ordering within subject
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    subject = relationship("TheorySubject", back_populates="posts")

# --- SQL SKILLS ---

class SQLDataset(Base):
    """Un dataset/esquema reutilizable (p.ej. 'Tienda', 'Hospital')."""
    __tablename__ = "sql_datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)          # "Tienda"
    description = Column(Text, nullable=True)
    schema_sql = Column(Text, nullable=False)      # CREATE TABLE ...
    seed_sql = Column(Text, nullable=False)        # INSERT INTO ...
    er_diagram_url = Column(String, nullable=True) # imagen opcional
    created_at = Column(DateTime, default=datetime.utcnow)
    exercises = relationship("SQLExercise", back_populates="dataset")

class SQLLevel(Base):
    """Niveles del Roadmap de SQL (p.ej. 'Nivel 1: Fundamentos')."""
    __tablename__ = "sql_levels"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="🎯") # Icono para el Roadmap
    order_index = Column(Integer, default=0)
    required_prev_level_id = Column(Integer, ForeignKey("sql_levels.id"), nullable=True) # Para bloqueo
    created_at = Column(DateTime, default=datetime.utcnow)

    exercises = relationship("SQLExercise", back_populates="level")

class SQLExercise(Base):
    """Un ejercicio SQL individual dentro de un dataset."""
    __tablename__ = "sql_exercises"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("sql_datasets.id"), nullable=False)
    level_id = Column(Integer, ForeignKey("sql_levels.id"), nullable=True) # Nuevo: Vinculación al Roadmap
    title = Column(String, nullable=False)          # "Ejercicio 1"
    category = Column(String, nullable=False)       # "Consultas Sencillas"
    order_num = Column(Integer, default=0)
    difficulty = Column(String, default="basico")  # basico | intermedio | avanzado
    description = Column(Text, nullable=False)      # Enunciado del ejercicio
    wiki_title = Column(String, nullable=True)      # Título de la sección wiki
    wiki_content = Column(Text, nullable=True)      # Teoría en Markdown
    wiki_syntax = Column(Text, nullable=True)       # Bloque de sintaxis SQL
    wiki_example = Column(Text, nullable=True)      # Query de ejemplo
    solution_sql = Column(Text, nullable=False)     # Solución correcta
    expected_result = Column(Text, nullable=True)   # JSON serializado del resultado esperado
    xp_reward = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
    is_free = Column(Boolean, default=False)        # Free preview — accessible without subscription
    # Tipo de ejercicio: free_query | fill_blank | find_bug | order_clauses | reverse_query
    exercise_type = Column(String, default='free_query', nullable=False)
    template_sql = Column(Text, nullable=True)      # Para fill_blank: query con ___ como huecos
    buggy_sql = Column(Text, nullable=True)         # Para find_bug: query incorrecta a corregir
    fragments = Column(Text, nullable=True)         # Para order_clauses: JSON array de fragmentos
    created_at = Column(DateTime, default=datetime.utcnow)
    dataset = relationship("SQLDataset", back_populates="exercises")
    level = relationship("SQLLevel", back_populates="exercises")
    user_progress = relationship("UserSQLProgress", back_populates="exercise")

class UserSQLProgress(Base):
    """Progreso de un alumno en SQL Skills."""
    __tablename__ = "user_sql_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("sql_exercises.id"), nullable=False, index=True)
    completed = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    last_query = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    xp_awarded = Column(Boolean, default=False)
    exercise = relationship("SQLExercise", back_populates="user_progress")
    __table_args__ = (Index("ix_user_sql_progress_user_exercise", "user_id", "exercise_id"),)

class SkillLabSession(Base):
    """Tracks each completed Skill Lab run — used for daily limits, leaderboard, and mastery."""
    __tablename__ = "skill_lab_sessions"

    id                 = Column(Integer, primary_key=True, index=True)
    user_id            = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject            = Column(String, nullable=False, index=True)
    difficulty         = Column(String, default="easy")       # easy | medium | hard
    total_exercises    = Column(Integer, default=0)
    correct_exercises  = Column(Integer, default=0)
    failed_attempts    = Column(Integer, default=0)
    xp_gained          = Column(Integer, default=0)
    is_perfect         = Column(Boolean, default=False)
    is_daily_challenge = Column(Boolean, default=False)
    is_exam_mode       = Column(Boolean, default=False)
    completed_at       = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="skill_lab_sessions")


# ── Analytics Events ─────────────────────────────────────────────────────────
class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(64), nullable=False, index=True)   # e.g. 'lab_step_abandoned', 'test_question_failed'
    resource_id = Column(String(128), nullable=True, index=True)  # lab_id, question_id, etc.
    resource_type = Column(String(32), nullable=True)             # 'winlab', 'test', 'flashcard'
    extra = Column(JSON, nullable=True)                           # arbitrary extra data
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# ── Flashcard Spaced Repetition (SM-2) ───────────────────────────────────────
class FlashcardProgress(Base):
    __tablename__ = "flashcard_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    card_id = Column(String(128), nullable=False, index=True)
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)       # days until next review
    repetitions = Column(Integer, default=0)
    next_review = Column(DateTime, default=datetime.utcnow)
    last_quality = Column(Integer, default=0)   # 0-5 scale (SM-2 quality)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (UniqueConstraint('user_id', 'card_id', name='uq_flashcard_user_card'),)

# ── OAuth Accounts ────────────────────────────────────────────────────────────
class OAuthAccount(Base):
    """
    Vincula un proveedor OAuth (Google, Microsoft) con un usuario interno.
    NO almacenamos access_token ni refresh_token del proveedor:
    - No los necesitamos para autenticación (solo usamos el id_token para identificar)
    - Reducimos la superficie de ataque en caso de brecha en la BD
    """
    __tablename__ = "oauth_accounts"
    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider         = Column(String(32),  nullable=False)    # 'google' | 'microsoft'
    provider_user_id = Column(String(256), nullable=False)    # sub de Google / id de Microsoft
    created_at       = Column(DateTime, default=datetime.utcnow)
    # UNIQUE(provider, provider_user_id) previene cuentas duplicadas
    __table_args__ = (UniqueConstraint('provider', 'provider_user_id', name='uq_oauth_provider_uid'),)


# --- AUDIT LOG ADMIN ---

class AdminAuditLog(Base):
    """Registro de acciones administrativas para auditoría y cumplimiento."""
    __tablename__ = "admin_audit_logs"
    id               = Column(Integer, primary_key=True, index=True)
    admin_id         = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    admin_name       = Column(String, nullable=False)
    action           = Column(String, nullable=False, index=True)  # role_change | password_reset | subscription_change | user_delete
    target_user_id   = Column(Integer, nullable=True, index=True)
    target_user_name = Column(String, nullable=True)
    old_value        = Column(String, nullable=True)
    new_value        = Column(String, nullable=True)
    timestamp        = Column(DateTime, default=datetime.utcnow, index=True)


def create_tables():
    Base.metadata.create_all(bind=engine)

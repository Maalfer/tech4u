from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict
from datetime import datetime

# ==============================
# AUTH & USER MODELS
# ==============================

class UserRegister(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    subscription_type: Optional[str] = "free"
    referral_code: Optional[str] = None

class AdminUserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("alumno", pattern="^(admin|developer|docente|alumno)$")
    subscription_type: str = "free"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    nombre: str
    email: str
    streak_count: int
    months_subscribed: int
    subscription_type: str
    role: str
    streak_protections: int
    subscription_end: Optional[datetime] = None
    referral_code: Optional[str] = None
    referral_reward_count: int = 0
    pending_10p_discounts: int = 0
    free_months_accumulated: int = 0

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(admin|developer|docente|alumno)$")


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class UserSubscriptionUpdate(BaseModel):
    subscription_type: str = Field(..., pattern="^(free|monthly|quarterly|annual|lifetime)$")
    subscription_end: Optional[datetime] = None


class AdminPasswordReset(BaseModel):
    password: str = Field(..., min_length=6)


class AdminProfileUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None


class AdminSetShields(BaseModel):
    shields: int = Field(..., ge=0, le=10)


class AdminModifyXP(BaseModel):
    xp: int = Field(..., ge=0)


class AdminSetStreak(BaseModel):
    streak: int = Field(..., ge=0)


# ==============================
# TICKETS
# ==============================

class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10)


class TicketMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class TicketMessageOut(BaseModel):
    id: int
    ticket_id: int
    sender_role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketUserInfoOut(BaseModel):
    nombre: str
    email: str
    role: str
    subscription_type: str
    streak_count: int
    streak_protections: int
    months_subscribed: int
    subscription_end: Optional[datetime] = None

    class Config:
        from_attributes = True


class TicketOut(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    status: str
    admin_reply: Optional[str] = None # Legacy support
    replied_at: Optional[datetime] = None # Legacy support
    created_at: datetime
    messages: List[TicketMessageOut] = []
    user_info: Optional[TicketUserInfoOut] = None

    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(pendiente|resuelto)$")
    admin_reply: Optional[str] = None


# ==============================
# ANNOUNCEMENTS
# ==============================

class AnnouncementCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class AnnouncementOut(BaseModel):
    id: int
    content: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================
# QUESTION SUGGESTIONS
# ==============================

class SuggestionCreate(BaseModel):
    subject: str = Field(..., min_length=2, max_length=100)
    text: str = Field(..., min_length=10)


class SuggestionOut(BaseModel):
    id: int
    user_id: int
    subject: str
    text: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================
# ADMIN DASHBOARD
# ==============================

class AdminDashboardStats(BaseModel):
    total_users: int
    active_subscriptions: int
    revenue_this_month: float
    pending_tickets: int
    total_questions: int
    users_by_role: Dict[str, int]
    revenue_history: List[float]
    login_peaks: List[int]


# ==============================
# COUPONS
# ==============================

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, pattern="^[A-Z0-9_-]+$")
    discount_percent: float = Field(..., ge=0, le=100)
    max_uses: int = Field(1, ge=1)
    is_active: bool = True
    assigned_to_id: Optional[int] = None

class CouponOut(BaseModel):
    id: int
    code: str
    discount_percent: float
    max_uses: int
    current_uses: int
    is_active: bool
    assigned_to_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==============================
# DASHBOARD ALUMNO
# ==============================

class SubjectStats(BaseModel):
    subject: str
    total_answered: int
    correct_answers: int
    accuracy: float
    time_invested_minutes: float


class DashboardStats(BaseModel):
    streak_count: int
    months_subscribed: int
    last_login: Optional[datetime]
    subscription_type: str
    subjects: List[SubjectStats]
    total_questions_answered: int
    total_errors: int
    current_xp: int
    next_level_xp: int
    rank_name: str
    level: int
    pending_10p_discounts: int
    free_months_accumulated: int
    referral_reward_count: int


# ==============================
# QUESTIONS & TESTS
# ==============================

class QuestionOut(BaseModel):
    id: int
    subject: str
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: Optional[str] = None
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    explanation: Optional[str] = None

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    subject: str = Field(..., min_length=2, max_length=100)
    text: str = Field(..., min_length=5)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answer: str = Field(..., pattern="^[abcd]$")
    difficulty: str = Field("medium", pattern="^(easy|medium|hard)$")
    explanation: Optional[str] = None


class AnswerItem(BaseModel):
    question_id: int
    selected_answer: str
    time_spent_seconds: Optional[float] = 0


class TestSubmit(BaseModel):
    subject: str
    answers: List[AnswerItem]
    test_mode: str


# 🔥 MODELO DETALLADO PARA REVISIÓN DE TEST
class DetailedAnswerResult(BaseModel):
    question_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    selected_answer: str
    correct_answer: str
    correct: bool
    explanation: Optional[str] = None


class TestResult(BaseModel):
    total: int
    correct: int
    accuracy: float
    xp_gained: int
    leveled_up: bool
    new_level: int
    detailed_results: List[DetailedAnswerResult]


# ==============================
# RESOURCES
# ==============================

class ResourceOut(BaseModel):
    id: int
    title: str
    subject: str
    description: Optional[str]
    file_type: str
    url: Optional[str]
    requires_subscription: bool

    class Config:
        from_attributes = True


class ResourceCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    file_type: str
    url: Optional[str] = None
    requires_subscription: bool = True

# ==============================
# VIDEO COURSES
# ==============================

class VideoLessonCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    youtube_url: Optional[str] = None       # YT Help courses
    video_file_path: Optional[str] = None   # Shop courses (self-hosted)
    order_index: Optional[int] = Field(0, ge=0)

class VideoLessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    youtube_url: Optional[str]
    video_file_path: Optional[str] = None
    order_index: int
    created_at: datetime
    is_completed: Optional[bool] = False  # Set dynamically when listing for a user

    class Config:
        from_attributes = True

class VideoCourseCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    is_shop_course: Optional[bool] = False
    is_active: Optional[bool] = True

class VideoCourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    price: Optional[float] = None
    is_shop_course: Optional[bool] = False
    is_active: Optional[bool] = True
    created_at: datetime
    lessons: List[VideoLessonOut] = []
    progress_percentage: Optional[int] = 0  # Set dynamically when listing for a user
    is_purchased: Optional[bool] = False     # Set dynamically: True if user has bought this course

    class Config:
        from_attributes = True

class UserCoursePurchaseOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    purchased_at: datetime
    amount_paid: Optional[float] = None

    class Config:
        from_attributes = True

class LessonProgressOut(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed_at: datetime

    class Config:
        from_attributes = True

# ==============================
# SKILL LABS (Drag and Drop)
# ==============================

class SkillLabOut(BaseModel):
    id: int
    subject: str
    sentence_template: str
    correct_answers: str
    distractors: str
    explanation: Optional[str] = None
    difficulty: str

    class Config:
        from_attributes = True

class SkillLabCreate(BaseModel):
    subject: str 
    sentence_template: str
    correct_answers: str # JSON
    distractors: str # JSON
    explanation: Optional[str] = None
    difficulty: str = "medium"


# ==============================
# PAYPAL
# ==============================

class PayPalOrderCreate(BaseModel):
    amount: float = Field(..., ge=0)
    subscription_type: str = Field(..., pattern="^(monthly|quarterly|annual)$")


class PayPalOrderOut(BaseModel):
    id: int
    paypal_order_id: str
    status: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True


# ==============================
# ACHIEVEMENTS
# ==============================

class AchievementOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    rarity: str
    xp_bonus: int

    class Config:
        from_attributes = True


class UserAchievementOut(BaseModel):
    id: int
    achievement: AchievementOut
    obtained_at: datetime

    class Config:
        from_attributes = True


# ==============================
# TERMINAL LABS
# ==============================

class ChallengeOut(BaseModel):
    id: str
    lab_id: int
    title: str
    description: Optional[str] = None
    validation_type: str
    validation_value: Optional[str] = None
    validation_extra: Optional[str] = None
    order_index: int
    xp: int
    hints: Optional[str] = None
    is_completed: bool = False # Added dynamically in router

    class Config:
        from_attributes = True

class LabBase(BaseModel):
    title: str
    description: Optional[str] = None
    goal_description: str
    difficulty: str = "medium"
    category: str = "Linux"
    xp_reward: int = 150
    time_limit: int = 30
    docker_image: str = "ubuntu:22.04"
    scenario_setup: Optional[str] = None
    validation_rules: Optional[str] = None
    validation_command: Optional[str] = None
    expected_result: Optional[str] = None
    expected_flag: Optional[str] = None
    step_by_step_guide: Optional[str] = None
    module_id: Optional[int] = None
    is_active: bool = True
    order_index: int = 0

class LabCreate(LabBase):
    pass

class LabOut(LabBase):
    id: int
    is_completed: bool = False
    is_unlocked: bool = True
    challenges: List[ChallengeOut] = []

    class Config:
        from_attributes = True

class ModuleCreate(BaseModel):
    skill_path_id: int
    title: str
    description: Optional[str] = None
    order_index: int = 0
    requires_validation: bool = True
    is_active: bool = True

class ModuleOut(BaseModel):
    id: int
    skill_path_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    requires_validation: bool = True
    is_active: bool = True
    labs: List[LabOut] = []

    class Config:
        from_attributes = True

class SkillPathCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: str = "easy"
    order_index: int = 0
    is_active: bool = True

class SkillPathOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    difficulty: str = "easy"
    order_index: int
    is_active: bool = True
    modules: List[ModuleOut] = []

    class Config:
        from_attributes = True


class TerminalStartResponse(BaseModel):
    container_id: str
    ws_url: str


class LabCompleteResponse(BaseModel):
    success: bool
    message: str
    xp_gained: int = 0
    leveled_up: bool = False
    new_level: int = 1
    flag_found: bool = False

class ChallengeValidationRequest(BaseModel):
    challenge_id: str
    student_input: Optional[str] = None

class ChallengeCompletionOut(BaseModel):
    id: int
    user_id: int
    lab_id: int
    challenge_id: str
    completed_at: datetime

    class Config:
        from_attributes = True

# Rebuild models (Pydantic v2)
TokenResponse.model_rebuild()
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

# ==============================
# AUTH & USER MODELS
# ==============================

class UserRegister(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    subscription_type: Optional[str] = "free"
    referral_code: Optional[str] = None

class AdminUserCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    role: str = "alumno"
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
    subscription_end: Optional[datetime]
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
    role: str


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str


class UserSubscriptionUpdate(BaseModel):
    subscription_type: str
    subscription_end: Optional[datetime] = None


# ==============================
# TICKETS
# ==============================

class TicketCreate(BaseModel):
    subject: str
    description: str


class TicketMessageCreate(BaseModel):
    content: str


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
    status: Optional[str] = None
    admin_reply: Optional[str] = None


# ==============================
# ANNOUNCEMENTS
# ==============================

class AnnouncementCreate(BaseModel):
    content: str


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
    subject: str
    text: str


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
    code: str
    discount_percent: float
    max_uses: int = 1
    is_active: bool = True

class CouponOut(BaseModel):
    id: int
    code: str
    discount_percent: float
    max_uses: int
    current_uses: int
    is_active: bool
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
    difficulty: str
    explanation: Optional[str] = None

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    subject: str
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    difficulty: str
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
    title: str
    description: Optional[str] = None
    youtube_url: Optional[str] = None       # YT Help courses
    video_file_path: Optional[str] = None   # Shop courses (self-hosted)
    order_index: Optional[int] = 0

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
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Optional[float] = None
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

# Rebuild models (Pydantic v2)
TokenResponse.model_rebuild()
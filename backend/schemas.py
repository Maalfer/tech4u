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
    subscription_end: Optional[datetime]
    role: str

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


class TicketOut(BaseModel):
    id: int
    user_id: int
    subject: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


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


# Rebuild models (Pydantic v2)
TokenResponse.model_rebuild()
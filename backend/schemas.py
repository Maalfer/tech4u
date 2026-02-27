from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth
class UserRegister(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    subscription_type: Optional[str] = "free"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    nombre: str
    email: str
    streak_count: int
    subscription_type: str
    subscription_end: Optional[datetime]
    role: str
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

class UserPasswordUpdate(BaseModel):
    new_password: str

TokenResponse.model_rebuild()

# Dashboard
class SubjectStats(BaseModel):
    subject: str
    total_answered: int
    correct_answers: int
    accuracy: float
    time_invested_minutes: float

class DashboardStats(BaseModel):
    streak_count: int
    last_login: Optional[datetime]
    subscription_type: str
    subjects: List[SubjectStats]
    total_questions_answered: int
    total_errors: int

# Questions
class QuestionOut(BaseModel):
    id: int
    subject: str
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: Optional[str] = None  # Added for admin view, normal endpoints obfuscate this
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
    selected_answer: str  # "a", "b", "c", "d"
    time_spent_seconds: Optional[float] = 0

class TestSubmit(BaseModel):
    subject: str
    answers: List[AnswerItem]
    test_mode: str  # normal | exam | errors

class AnswerResult(BaseModel):
    question_id: int
    correct: bool
    correct_answer: str
    explanation: Optional[str]

class TestResult(BaseModel):
    total: int
    correct: int
    accuracy: float
    results: List[AnswerResult]

# Resources
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

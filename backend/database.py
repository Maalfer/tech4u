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
    subscription_end = Column(DateTime, nullable=True)
    role = Column(String, default="alumno") 
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    errors = relationship("UserError", back_populates="user")
    progress = relationship("UserProgress", back_populates="user")
    suggestions = relationship("QuestionSuggestion", back_populates="user")

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
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

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

# --- UTILIDADES ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
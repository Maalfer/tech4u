import os
import json
import asyncio
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, make_transient
from database import (
    Base, User, UserProgress, Question, Resource, UserError, 
    Ticket, TicketMessage, Announcement, QuestionSuggestion, 
    AcademyStats, Coupon, AnnouncementRead, VideoCourse, 
    VideoLesson, LessonProgress, UserCoursePurchase, TestSession, 
    UserItem, Achievement, UserAchievement, PayPalOrder, 
    SkillLabExercise, Lab, UserLabCompletion, UserChallengeCompletion
)

# --- CONFIGURATION ---
# Change these to your actual connection strings if different
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./tech4u.db")
POSTGRES_URL = os.getenv("DATABASE_URL") # Should be the postgres one in .env

if not POSTGRES_URL or not POSTGRES_URL.startswith("postgresql"):
    print("❌ ERROR: DATABASE_URL in .env must be a postgresql:// connection string.")
    print("Example: postgresql://postgres:password@localhost:5432/tech4u")
    exit(1)

def migrate():
    print(f"🔄 Starting migration from {SQLITE_URL} to {POSTGRES_URL}...")
    
    sqlite_engine = create_engine(SQLITE_URL)
    postgres_engine = create_engine(POSTGRES_URL)
    
    # 1. Create tables in Postgres
    print("🚀 Creating tables in PostgreSQL...")
    Base.metadata.create_all(postgres_engine)
    
    # 2. Setup Sessions
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    s_db = SqliteSession()
    p_db = PostgresSession()
    
    # Ordered list of models to respect foreign key constraints during migration
    models = [
        User, Question, Achievement, AcademyStats, Announcement, 
        VideoCourse, Lab, SkillLabExercise, 
        UserProgress, Resource, UserError, Ticket, QuestionSuggestion, 
        Coupon, AnnouncementRead, VideoLesson, TestSession, UserItem, 
        UserAchievement, PayPalOrder, UserLabCompletion, UserChallengeCompletion,
        TicketMessage, LessonProgress, UserCoursePurchase
    ]

    # --- CLEANING STEP ---
    print("🧹 Cleaning target tables in PostgreSQL to avoid duplicates...")
    for model in reversed(models):
        try:
            p_db.query(model).delete()
        except:
            p_db.rollback()
    p_db.commit()
    
    try:
        # Pre-fetch valid IDs for filtering orphans
        valid_users = {u.id for u in s_db.query(User.id).all()}
        valid_questions = {q.id for q in s_db.query(Question.id).all()}
        valid_labs = {l.id for l in s_db.query(Lab.id).all()}
        valid_achievements = {a.id for a in s_db.query(Achievement.id).all()}
        valid_tickets = {t.id for t in s_db.query(Ticket.id).all()}
        valid_courses = {c.id for c in s_db.query(VideoCourse.id).all()}
        valid_lessons = {l.id for l in s_db.query(VideoLesson.id).all()}

        for model in models:
            table_name = model.__tablename__
            print(f"📦 Migrating {table_name}...")
            
            items = s_db.query(model).all()
            if not items:
                print(f"   (No data in {table_name})")
                continue
                
            # Filter orphans for tables with critical foreign keys
            if model == UserError:
                items = [i for i in items if i.question_id in valid_questions and i.user_id in valid_users]
            elif model == UserProgress:
                items = [i for i in items if i.user_id in valid_users]
            elif model == Ticket:
                items = [i for i in items if i.user_id in valid_users]
            elif model == TicketMessage:
                items = [i for i in items if i.ticket_id in valid_tickets]
            elif model == UserLabCompletion:
                items = [i for i in items if i.user_id in valid_users and i.lab_id in valid_labs]
            elif model == UserChallengeCompletion:
                items = [i for i in items if i.user_id in valid_users and i.lab_id in valid_labs]
            # Add more filters if needed...

            count = 0
            for item in items:
                try:
                    s_db.expunge(item)
                    make_transient(item)
                    p_db.add(item)
                    count += 1
                except Exception as e:
                    print(f"   ⚠️ Skipping record in {table_name}: {e}")
                
            p_db.commit()
            print(f"   ✅ Migrated {count} records from {table_name}.")

        # 3. Synchronize PostgreSQL Sequences
        # (Needed because we inserted IDs manually, so the sequence counter is behind)
        print("🔗 Synchronizing PostgreSQL sequences...")
        with postgres_engine.connect() as conn:
            inspector = inspect(postgres_engine)
            for table_name in inspector.get_table_names():
                # Get the primary key column (usually 'id')
                pk_cols = inspector.get_pk_constraint(table_name)['constrained_columns']
                if pk_cols and pk_cols[0] == 'id':
                    seq_query = text(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), (SELECT MAX(id) FROM {table_name}))")
                    try:
                        conn.execute(seq_query)
                        conn.commit()
                    except Exception as e:
                        # Some tables might not have sequences if they don't use Serial
                        pass
        
        print("\n🎉 MIGRATION SUCCESSFUL!")
        print("Now you can safely start the server using PostgreSQL.")

    except Exception as e:
        print(f"❌ MIGRATION FAILED: {str(e)}")
        p_db.rollback()
    finally:
        s_db.close()
        p_db.close()

if __name__ == "__main__":
    migrate()

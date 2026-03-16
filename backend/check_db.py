from database import SessionLocal, SQLExercise, SQLDataset
from sqlalchemy import func

def check():
    db = SessionLocal()
    try:
        print("--- Exercise Types Count ---")
        types = db.query(SQLExercise.exercise_type, func.count(SQLExercise.id)).group_by(SQLExercise.exercise_type).all()
        for t in types:
            print(f"{t[0]}: {t[1]}")
        
        print("\n--- Empresa IT Ordering ---")
        ds = db.query(SQLDataset).filter(SQLDataset.name == 'Empresa IT').first()
        if ds:
            exercises = db.query(SQLExercise).filter(SQLExercise.dataset_id == ds.id).order_by(SQLExercise.id).limit(10).all()
            for ex in exercises:
                print(f"ID: {ex.id}, Title: {ex.title}, Order: {ex.order_num}")
        
        print("\n--- Tienda Categories ---")
        ds_t = db.query(SQLDataset).filter(SQLDataset.name == 'Tienda').first()
        if ds_t:
            categories = db.query(SQLExercise.category).filter(SQLExercise.dataset_id == ds_t.id).distinct().all()
            for cat in categories:
                print(f"Category: {cat[0]}")
                
    finally:
        db.close()

if __name__ == "__main__":
    check()

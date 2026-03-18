from database import SessionLocal, User
from auth import hash_password

def reset_passwords():
    db = SessionLocal()
    users_to_reset = ["admin@tech4u.es", "alumno1@tech4u.es"]
    import os
    new_password = os.getenv("DEFAULT_USER_PASSWORD", "tech4u2024")
    if new_password == "tech4u2024":
        print("⚠️  AVISO: Usando password por defecto 'tech4u2024'.")
    
    for email in users_to_reset:
        user = db.query(User).filter(User.email.ilike(email)).first()
        if user:
            user.password_hash = hash_password(new_password)
            print(f"Password for {email} reset to: {new_password}")
        else:
            print(f"User {email} not found.")
    
    db.commit()
    db.close()

if __name__ == "__main__":
    reset_passwords()

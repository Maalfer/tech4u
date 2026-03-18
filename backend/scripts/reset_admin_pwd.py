from database import SessionLocal, User
from auth import hash_password
import sys

def reset_password(email, new_password):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found")
        db.close()
        return
    
    user.password_hash = hash_password(new_password)
    db.commit()
    print(f"Password for {email} reset successfully.")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python reset_admin_pwd.py <email> <nuevo_password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    reset_password(email, password)

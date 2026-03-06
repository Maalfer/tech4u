from database import SessionLocal, User
from auth import verify_password
import sys

def debug_login(email, password):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User {email} not found")
        db.close()
        return
    
    print(f"User found: {user.email}")
    print(f"Stored Hash: {user.password_hash}")
    
    # Try manual verification
    is_valid = verify_password(password, user.password_hash)
    print(f"Verification for '{password}': {is_valid}")
    db.close()

if __name__ == "__main__":
    debug_login("admin@tech4u.es", "Tecnologia4u_2024!")
    # Also test without the exclamation mark just in case
    # debug_login("admin@tech4u.es", "Tecnologia4u_2024")

import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, User, Base, engine
from auth import hash_password
from datetime import datetime

def test_db():
    Base.metadata.create_all(bind=engine)

def create_users():
    db = SessionLocal()
    is_prod = os.getenv("ENVIRONMENT", "development") == "production"
    
    # REQUIRE environment variable in production, allow default ONLY in dev
    default_pass = os.getenv("DEFAULT_USER_PASSWORD")
    if not default_pass:
        if is_prod:
            log_err = "🚨 ERROR: DEFAULT_USER_PASSWORD must be set in production!"
            print(log_err)
            raise RuntimeError(log_err)
        default_pass = "cambiame123"
        print("⚠️  AVISO: Usando password por defecto 'cambiame123' para desarrollo.")

    try:
        users_to_create = [
            {
                "email": "admin@tech4u.es",
                "nombre": "Administrador Principal",
                "password": os.getenv("ADMIN_PASSWORD", default_pass),
                "role": "admin",
                "subscription_type": "annual"
            },
            {
                "email": "alumno1@tech4u.es",
                "nombre": "Alumno Prueba FP",
                "password": default_pass,
                "role": "alumno",
                "subscription_type": "free"
            }
        ]

        print("🚀 Creando usuarios por defecto...")
        for u_data in users_to_create:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"🔄 Actualizando password para {u_data['email']}...")
                existing.password_hash = hash_password(u_data["password"])
                db.commit()
                continue



            new_user = User(
                email=u_data["email"],
                nombre=u_data["nombre"],
                password_hash=hash_password(u_data["password"]),
                role=u_data["role"],
                subscription_type=u_data["subscription_type"],
                last_login=datetime.utcnow()
            )
            db.add(new_user)
            print(f"✅ Añadido nuevo usuario {u_data['email']} ({u_data['role']})")
        
        db.commit()
        print("🎉 Script completado con éxito.")
    except Exception as e:
        print(f"❌ Error al crear usuarios: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
    create_users()

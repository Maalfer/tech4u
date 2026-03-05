import sys
from sqlalchemy.orm import Session
from database import SessionLocal, create_tables, User
from auth import hash_password
from datetime import datetime

def test_db():
    create_tables()

def create_users():
    db = SessionLocal()
    try:
        users_to_create = [
            {
                "email": "admin@tech4u.es",
                "nombre": "Administrador Principal",
                "password": "tech4u_admin",
                "role": "admin",
                "subscription_type": "annual"
            },
            {
                "email": "docente1@tech4u.es",
                "nombre": "Profesor DAW",
                "password": "tech4u_docente",
                "role": "docente",
                "subscription_type": "annual"
            },
            {
                "email": "alumno1@tech4u.es",
                "nombre": "Alumno Prueba FP",
                "password": "tech4u_alumno",
                "role": "alumno",
                "subscription_type": "free"
            }
        ]

        print("🚀 Creando usuarios por defecto...")
        for u_data in users_to_create:
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if existing:
                print(f"✅ Usuario {u_data['email']} ({u_data['role']}) ya existe.")
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
            print(f"✅ Añadido nuevo usuario {u_data['email']} ({u_data['role']}) con pass '{u_data['password']}'")
        
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

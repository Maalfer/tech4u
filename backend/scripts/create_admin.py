"""
Script de uso único: crear (o actualizar) la cuenta de administrador principal.

Ejecutar dentro del container de backend en el VPS:

    docker exec -e ADMIN_EMAIL="tech4uacademy@gmail.com" \
                -e ADMIN_NOMBRE="Alberto Hidalgo Moreno" \
                -e ADMIN_PASSWORD="<contraseña>" \
                tech4u-backend \
                python scripts/create_admin.py

Si el usuario ya existe, solo actualiza nombre, contraseña y rol.
Elimina este archivo del repo tras ejecutarlo si quieres.
"""

import os
import sys
import secrets
import string
from datetime import datetime

# Añadir el directorio raíz del backend al path para poder importar database/auth
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, User
from auth import hash_password

# ── Parámetros ────────────────────────────────────────────────────────────────
ADMIN_EMAIL    = os.environ["ADMIN_EMAIL"]      # Falla si no está definida
ADMIN_NOMBRE   = os.environ["ADMIN_NOMBRE"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

if len(ADMIN_PASSWORD) < 8:
    print("❌ La contraseña es demasiado corta (mínimo 8 caracteres)")
    sys.exit(1)

# ── Referral code único ───────────────────────────────────────────────────────
def _unique_referral_code(db, length=8):
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = ''.join(secrets.choice(alphabet) for _ in range(length))
        if not db.query(User).filter(User.referral_code == code).first():
            return code
    raise RuntimeError("No se pudo generar un referral_code único")

# ── Main ──────────────────────────────────────────────────────────────────────
db = SessionLocal()
try:
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()

    if existing:
        print(f"🔄 Usuario '{ADMIN_EMAIL}' ya existe — actualizando nombre, contraseña y rol...")
        existing.nombre        = ADMIN_NOMBRE
        existing.password_hash = hash_password(ADMIN_PASSWORD)
        existing.role          = "admin"
        existing.subscription_type = "annual"
        db.commit()
        print(f"✅ Admin actualizado correctamente (id={existing.id})")
    else:
        print(f"🚀 Creando nuevo admin '{ADMIN_EMAIL}'...")
        user = User(
            nombre             = ADMIN_NOMBRE,
            email              = ADMIN_EMAIL,
            password_hash      = hash_password(ADMIN_PASSWORD),
            role               = "admin",
            subscription_type  = "annual",
            streak_count       = 0,
            xp                 = 0,
            level              = 1,
            last_login         = datetime.utcnow(),
            created_at         = datetime.utcnow(),
            onboarding_completed = True,
            referral_code      = _unique_referral_code(db),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Admin creado correctamente (id={user.id}, email={user.email})")

except KeyError as e:
    print(f"❌ Variable de entorno requerida no definida: {e}")
    print("   Usa: docker exec -e ADMIN_EMAIL=... -e ADMIN_NOMBRE=... -e ADMIN_PASSWORD=... tech4u-backend python scripts/create_admin.py")
    sys.exit(1)
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    sys.exit(1)
finally:
    db.close()

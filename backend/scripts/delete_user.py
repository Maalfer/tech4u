import os
import sys
import argparse
from sqlalchemy import text

# Añadir el directorio raíz del backend al path para poder importar database
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, User

def delete_user(identifier, by_email=True):
    db = SessionLocal()
    try:
        if by_email:
            user = db.query(User).filter(User.email == identifier).first()
        else:
            user = db.query(User).filter(User.nombre == identifier).first()

        if not user:
            print(f"❌ No se encontró ningún usuario con {'email' if by_email else 'nombre'}: {identifier}")
            return

        user_id = user.id
        print(f"⚠️ Preparando eliminación del usuario: {user.nombre} ({user.email}) [ID: {user_id}]")

        # Tablas a limpiar (ordenadas por dependencia si es necesario)
        # Nota: Usamos SQL directo para asegurar que limpiamos todo independientemente de la configuración del ORM
        tables_to_clean = [
            ("user_errors", "user_id"),
            ("user_progress", "user_id"),
            ("user_achievements", "user_id"),
            ("skill_lab_sessions", "user_id"),
            ("paypal_orders", "user_id"),
            ("ticket_messages", "ticket_id"), # Requiere subquery o join si no hay cascade
            ("tickets", "user_id"),
            ("question_suggestions", "user_id"),
            ("user_coupon_usage", "user_id"),
            ("announcement_reads", "user_id"),
            ("lesson_progress", "user_id"),
            ("user_course_purchases", "user_id"),
            ("test_sessions", "user_id"),
            ("user_items", "user_id"),
            ("user_challenge_completions", "user_id"),
            ("user_lab_completions", "user_id"),
            ("referrals", "referrer_id"),
            ("referrals", "referred_id"),
            ("user_sql_progress", "user_id"),
            ("analytics_events", "user_id"),
            ("flashcard_progress", "user_id"),
            ("oauth_accounts", "user_id"),
            ("admin_audit_logs", "admin_id"),
        ]

        # Especial: ticket_messages depende de tickets
        db.execute(text("DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM tickets WHERE user_id = :uid)"), {"uid": user_id})
        
        # Limpiar el resto de tablas
        for table, col in tables_to_clean:
            if table == "ticket_messages": continue # Ya manejado
            print(f"  - Limpiando tabla: {table}")
            db.execute(text(f"DELETE FROM {table} WHERE {col} = :uid"), {"uid": user_id})

        # Especial: self-referencial en users (referidos)
        db.execute(text("UPDATE users SET referred_by_id = NULL WHERE referred_by_id = :uid"), {"uid": user_id})

        # Finalmente, el usuario
        print(f"♻️ Eliminando entrada principal en 'users'...")
        db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})

        db.commit()
        print(f"✅ Usuario {identifier} eliminado correctamente junto con todos sus datos asociados.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error durante la eliminación: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Eliminar un usuario y todos sus datos relacionados.")
    parser.add_argument("--email", help="Email del usuario a borrar")
    parser.add_argument("--nombre", help="Nombre del usuario a borrar")
    
    args = parser.parse_args()

    if args.email:
        delete_user(args.email, by_email=True)
    elif args.nombre:
        delete_user(args.nombre, by_email=False)
    else:
        print("❌ Debes proporcionar --email o --nombre")
        print("Ejemplo: python scripts/delete_user.py --nombre 'Tech4U Admin'")

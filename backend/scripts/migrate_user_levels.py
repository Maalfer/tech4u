import sys
import os

# Añadir el path del backend para poder importar database
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal, User

def fix_all_users_levels():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"--- INICIANDO REPARACIÓN DE NIVELES PARA {len(users)} USUARIOS ---")
        
        for user in users:
            old_level = user.level
            # Guardamos la XP total actual para recalcular desde cero de forma limpia
            # Si el usuario tiene 2015 XP y está en Nivel 1, la nueva lógica lo subirá.
            
            # Nota: user.add_xp ya maneja la subida de nivel sustractiva.
            # Pero para usuarios "atascados", necesitamos re-procesar su XP acumulada.
            
            # Simulamos que le quitamos la XP y se la volvemos a dar con la nueva lógica
            total_xp_to_process = user.xp
            # Si queremos que la XP se mantenga como "XP total" y se convierta a "XP del nivel actual":
            # 1. Resetear nivel y XP temporalmente para este proceso
            user.level = 1
            user.xp = 0
            
            user.add_xp(total_xp_to_process)
            
            if user.level != old_level:
                print(f"✅ Usuario {user.email}: Nivel {old_level} -> {user.level} (XP restante: {user.xp})")
            else:
                print(f"ℹ️ Usuario {user.email}: Se mantiene en Nivel {user.level}")
        
        db.commit()
        print("--- REPARACIÓN COMPLETADA CON ÉXITO ---")
    except Exception as e:
        db.rollback()
        print(f"❌ ERROR DURANTE LA MIGRACIÓN: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_all_users_levels()

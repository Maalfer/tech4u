import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, SkillPath, Lab, UserLabCompletion, UserChallengeCompletion

def delete_linux_fundamentals():
    db = SessionLocal()
    try:
        path = db.query(SkillPath).filter(SkillPath.title == "Linux Fundamentals").first()
        if not path:
            print("ERROR: No se encontró ninguna ruta con título 'Linux Fundamentals'.")
            print("Rutas existentes:")
            for p in db.query(SkillPath).all():
                print(f"  [{p.id}] {p.title}")
            return

        print(f"Encontrada ruta: [{path.id}] {path.title}")
        print(f"  Módulos asociados: {len(path.modules)}")
        for m in path.modules:
            print(f"    [{m.id}] {m.title} — {len(m.labs)} labs")

        # Recoger todos los IDs de labs de esta ruta
        lab_ids = [lab.id for module in path.modules for lab in module.labs]
        print(f"\n  Labs a eliminar: {len(lab_ids)} (IDs: {lab_ids[:10]}{'...' if len(lab_ids)>10 else ''})")

        # Eliminar primero las completions que referencian estos labs (FK constraint)
        if lab_ids:
            deleted_challenges = db.query(UserChallengeCompletion).filter(
                UserChallengeCompletion.lab_id.in_(lab_ids)
            ).delete(synchronize_session=False)
            print(f"  UserChallengeCompletion eliminadas: {deleted_challenges}")

            deleted_labs = db.query(UserLabCompletion).filter(
                UserLabCompletion.lab_id.in_(lab_ids)
            ).delete(synchronize_session=False)
            print(f"  UserLabCompletion eliminadas: {deleted_labs}")

        # Ahora sí podemos eliminar la ruta (cascade elimina módulos y labs)
        db.delete(path)
        db.commit()
        print("\n✅ 'Linux Fundamentals' eliminado correctamente (módulos, labs y completions).")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_linux_fundamentals()

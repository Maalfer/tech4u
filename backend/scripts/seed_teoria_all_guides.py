"""
seed_teoria_all_guides.py
═══════════════════════════════════════════════════════════════════════════════
Inserta en la base de datos TODOS los subjects y guías de Teoría:

  • Redes              — 8 guías
  • Bases de Datos     — 6 guías
  • Sistemas Operativos— 6 guías
  • Hardware           — 4 guías
  • Lenguaje de Marcas — 3 guías
  ─────────────────────────────
  TOTAL                  27 guías

Uso:
    cd /path/to/backend
    source venv/bin/activate
    python scripts/seed_teoria_all_guides.py

    # O con el PYTHONPATH trick (si no tienes la venv activa):
    PYTHONPATH=venv/lib/python3.11/site-packages python3 scripts/seed_teoria_all_guides.py
═══════════════════════════════════════════════════════════════════════════════
"""

import os, sys, json, unicodedata, re
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://tech4u_admin:tech4u_admin@localhost:5432/tech4u")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ─── Slug helper ──────────────────────────────────────────────────────────────

def make_slug(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9\s-]", "", ascii_str.lower())
    slug = re.sub(r"[\s_]+", "-", slug).strip("-")
    return slug

# ─── Data ─────────────────────────────────────────────────────────────────────

DATA_PATH = os.path.join(os.path.dirname(__file__), "teoria_guides_data.json")

# ─── Seed ─────────────────────────────────────────────────────────────────────

def seed():
    from database import TheorySubject, TheoryPost

    if not os.path.exists(DATA_PATH):
        print(f"\n❌  No se encontró el archivo de datos: {DATA_PATH}")
        print("    Asegúrate de haber copiado 'teoria_guides_data.json' en la carpeta scripts/\n")
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        subjects_data = json.load(f)

    db = SessionLocal()
    try:
        total_subjects_created = 0
        total_posts_created = 0
        total_posts_skipped = 0

        for subj_data in subjects_data:
            # Get or create subject
            subject = db.query(TheorySubject).filter(
                TheorySubject.slug == subj_data["slug"]
            ).first()

            if not subject:
                subject = TheorySubject(
                    name=subj_data["name"],
                    slug=subj_data["slug"],
                    description=subj_data["description"],
                    icon=subj_data["icon"],
                    order_index=subj_data["order_index"],
                )
                db.add(subject)
                db.flush()
                total_subjects_created += 1
                print(f"\n✅  Subject creado: {subj_data['name']}")
            else:
                print(f"\nℹ️   Subject ya existe: {subj_data['name']} (id={subject.id})")

            # Insert posts
            for guide in subj_data["guides"]:
                post_slug = guide["slug"]

                existing = db.query(TheoryPost).filter(
                    TheoryPost.slug == post_slug
                ).first()

                if existing:
                    # Update content
                    existing.markdown_content = guide["markdown"]
                    existing.updated_at = datetime.utcnow()
                    total_posts_skipped += 1
                    print(f"    ↻  Actualizado: {guide['title'][:55]}")
                else:
                    post = TheoryPost(
                        subject_id=subject.id,
                        title=guide["title"],
                        slug=post_slug,
                        markdown_content=guide["markdown"],
                    )
                    db.add(post)
                    total_posts_created += 1
                    print(f"    +  Creado: {guide['title'][:55]}")

        db.commit()

        print(f"""
╔══════════════════════════════════════════════════════╗
║           SEED COMPLETADO CORRECTAMENTE              ║
╠══════════════════════════════════════════════════════╣
║  Subjects creados  : {total_subjects_created:<4}                            ║
║  Posts creados     : {total_posts_created:<4}                            ║
║  Posts actualizados: {total_posts_skipped:<4}                            ║
║  TOTAL posts       : {total_posts_created + total_posts_skipped:<4}                            ║
╚══════════════════════════════════════════════════════╝
""")

    except Exception as e:
        db.rollback()
        print(f"\n❌  Error durante la inserción: {e}\n")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🔧  Iniciando seed de todas las guías de Teoría...\n")
    seed()

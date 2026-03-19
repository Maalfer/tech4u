import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import engine, Base

print("🔧 Inicializando base de datos local (SQLite)...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas correctamente.")

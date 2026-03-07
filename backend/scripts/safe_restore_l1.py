import json
import os
import sys
from pathlib import Path

# Adjust path to import from parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import SessionLocal, Lab, Challenge, Module

def safe_restore_l1():
    db = SessionLocal()
    
    # 1. Identify L1 Module
    l1_module = db.query(Module).filter(Module.title == "Linux Labs L1 — Terminal Basics").first()
    if not l1_module:
        print("❌ Error: Module L1 not found.")
        return

    print(f"🚀 Safe Restore & Update for Module: {l1_module.title} (ID: {l1_module.id})")

    # 2. Re-insert Original 10 Labs (as INACTIVE)
    # Data extracted from seed_linux_fundamentals.py
    legacy_labs_data = [
        {"id": 1, "title": "Bienvenido a la terminal", "order_index": 101},
        {"id": 2, "title": "Dónde estoy", "order_index": 102},
        {"id": 3, "title": "Explorando directorios", "order_index": 103},
        {"id": 4, "title": "Subir de directorio", "order_index": 104},
        {"id": 5, "title": "Leer archivos", "order_index": 105},
        {"id": 6, "title": "Crear directorios", "order_index": 106},
        {"id": 7, "title": "Crear archivos", "order_index": 107},
        {"id": 8, "title": "Explorando múltiples archivos", "order_index": 108},
        {"id": 9, "title": "Entrar y salir de directorios", "order_index": 109},
        {"id": 10, "title": "Navegación completa", "order_index": 110},
    ]

    for l_data in legacy_labs_data:
        # Check if exists (might have been deleted)
        lab = db.query(Lab).filter(Lab.id == l_data["id"]).first()
        if not lab:
            # Create a shell for the legacy lab to preserve history/references if they existed
            lab = Lab(
                id=l_data["id"],
                module_id=l1_module.id,
                title=l_data["title"],
                description="Legacy lab (Disabled)",
                goal_description="Legacy",
                difficulty="easy",
                category="Linux",
                step_by_step_guide="Legacy",
                is_active=False,
                order_index=l_data["order_index"],
                xp_reward=0
            )
            db.add(lab)
        else:
            lab.is_active = False
            lab.order_index = l_data["order_index"]
    
    db.commit()
    print("✅ Legacy labs restored/set to inactive.")

    # 3. Ensure 6 Premium Labs are active and correctly ordered
    premium_labs = db.query(Lab).filter(Lab.module_id == l1_module.id, Lab.id >= 74).order_by(Lab.id).all()
    
    for i, lab in enumerate(premium_labs):
        lab.is_active = True
        lab.order_index = i + 1
        print(f"✨ Set active: {lab.title} (Order: {lab.order_index})")
    
    db.commit()
    print("✅ Premium labs activated and ordered.")
    db.close()

if __name__ == "__main__":
    safe_restore_l1()

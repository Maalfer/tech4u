import os
import sys
import subprocess

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import create_tables
from dotenv import load_dotenv

load_dotenv()

def run_script(path):
    print(f"--- Running: {path} ---")
    result = subprocess.run([sys.executable, path], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"Errors in {path}:")
        print(result.stderr)
    return result.returncode == 0

def restore():
    print("🚀 Starting Theory Restoration Process...")
    
    # 1. Recreate tables
    print("Step 1: Recreating database tables...")
    create_tables()
    print("✅ Tables initialized.")

    # 2. Run theory seed
    print("\nStep 2: Seeding theory guides...")
    theory_seed = os.path.join(os.path.dirname(__file__), "seed_teoria_all_guides.py")
    if run_script(theory_seed):
        print("✅ Theory seeding complete.")
    else:
        print("❌ Theory seeding failed.")

    # 3. Run general seed (questions/resources)
    print("\nStep 3: Seeding general content (questions/resources)...")
    general_seed = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed.py")
    if run_script(general_seed):
        print("✅ General seeding complete.")
    else:
        print("❌ General seeding failed.")

    print("\n🎉 Restoration process finished!")

if __name__ == "__main__":
    restore()

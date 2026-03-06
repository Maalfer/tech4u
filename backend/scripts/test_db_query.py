from database import SessionLocal, SkillPath
import json

db = SessionLocal()
paths = db.query(SkillPath).all()
print(f'Found {len(paths)} paths')
for p in paths:
    print(f'Path ID: {p.id}, Title: {p.title}')
    # Check if we can simulate the Pydantic serialization
    data = {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "difficulty": p.difficulty,
        "order_index": p.order_index,
        "modules_count": len(p.modules)
    }
    print(json.dumps(data, indent=2))
db.close()

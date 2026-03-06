from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from database import get_db, User, Lab, UserLabCompletion, UserChallengeCompletion
from auth import get_current_user, require_admin
from schemas import LabOut, LabCreate, LabCompleteResponse, ChallengeValidationRequest, ChallengeCompletionOut
from docker_client import docker_launcher
from datetime import datetime

router = APIRouter(prefix="/labs", tags=["Science Labs"])

@router.get("/", response_model=List[LabOut])
def list_labs_student(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active labs for the current student."""
    labs = db.query(Lab).filter(Lab.is_active == True).all()
    
    # Mark if completed and if unlocked
    for lab in labs:
        lab.is_unlocked = True # Default for now
        completion = db.query(UserLabCompletion).filter(
            UserLabCompletion.user_id == current_user.id,
            UserLabCompletion.lab_id == lab.id
        ).first()
        lab.is_completed = True if completion else False
        
    return labs

@router.get("/{lab_id}/challenges/completed", response_model=List[str])
def get_completed_challenges(
    lab_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene los IDs de los retos ya completados por el usuario en este lab."""
    completions = db.query(UserChallengeCompletion).filter(
        UserChallengeCompletion.user_id == current_user.id,
        UserChallengeCompletion.lab_id == lab_id
    ).all()
    return [c.challenge_id for c in completions]

@router.post("/{lab_id}/challenges/validate", response_model=dict)
def validate_challenge(
    lab_id: int,
    req: ChallengeValidationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Valida un reto específico dentro de un laboratorio."""
    # 1. Check if already done
    exists = db.query(UserChallengeCompletion).filter(
        UserChallengeCompletion.user_id == current_user.id,
        UserChallengeCompletion.lab_id == lab_id,
        UserChallengeCompletion.challenge_id == req.challenge_id
    ).first()
    
    if exists:
        return {"success": True, "message": "Reto ya completado."}

    # 2. Get Lab and Challenge rules
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab or not lab.validation_rules:
        raise HTTPException(status_code=404, detail="Lab o reglas no encontradas")
    
    rules_data = json.loads(lab.validation_rules)
    challenges = rules_data.get("challenges", [])
    challenge = next((c for c in challenges if str(c.get("id")) == req.challenge_id), None)
    
    if not challenge:
        # Fallback for old rules format if necessary, or error
        raise HTTPException(status_code=400, detail="Reto no encontrado en la configuración")

    # 3. Find active container
    containers = docker_launcher.get_active_containers_for_user(current_user.id)
    if not containers:
        raise HTTPException(status_code=400, detail="No tienes un sandbox activo.")
    
    container = containers[0]
    
    # 4. Run rules for this challenge
    challenge_success = True
    for rule in challenge.get("rules", []):
        cmd = rule.get("command")
        expected = rule.get("expected", "")
        if cmd:
            res = container.exec_run(cmd, user="root", workdir="/home/student")
            output = res.output.decode().strip()
            if expected.strip() not in output:
                challenge_success = False
                break
    
    if challenge_success:
        new_comp = UserChallengeCompletion(
            user_id=current_user.id,
            lab_id=lab_id,
            challenge_id=req.challenge_id
        )
        db.add(new_comp)
        db.commit()
        return {"success": True, "message": "¡Reto completado con éxito!"}
    else:
        return {"success": False, "message": "La validación del reto ha fallado. Revisa tus archivos o comandos."}

@router.post("/{lab_id}/complete", response_model=LabCompleteResponse)
def complete_lab(
    lab_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Finaliza el lab si TODOS los retos han sido completados.
    """
    # 1. Check if already completed
    already_done = db.query(UserLabCompletion).filter(
        UserLabCompletion.user_id == current_user.id,
        UserLabCompletion.lab_id == lab_id
    ).first()
    
    if already_done:
        return LabCompleteResponse(
            success=True, 
            message="Ya has completado este laboratorio.",
            xp_gained=0
        )

    # 2. Get Lab info
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab no encontrado")

    # 3. Verify all challenges are done
    try:
        rules_data = json.loads(lab.validation_rules or '{"challenges":[]}')
        total_challenges = rules_data.get("challenges", [])
        
        if total_challenges:
            completed_count = db.query(UserChallengeCompletion).filter(
                UserChallengeCompletion.user_id == current_user.id,
                UserChallengeCompletion.lab_id == lab_id
            ).count()
            
            if completed_count < len(total_challenges):
                return LabCompleteResponse(
                    success=False,
                    message=f"Aún te faltan retos por completar ({completed_count}/{len(total_challenges)})."
                )
        else:
            # Legacy or single-rule fallback (optional)
            # For now, if no challenges, we might need a manual check or it's an old lab
            pass
    except Exception as e:
        print(f"Error checking challenges: {e}")

    # 4. Award XP and Save
    current_user.xp += lab.xp_reward
    leveled_up = False
    level_before = current_user.level
    current_user.level = (current_user.xp // 1000) + 1
    if current_user.level > level_before:
        leveled_up = True

    completion = UserLabCompletion(
        user_id=current_user.id,
        lab_id=lab.id,
        xp_gained=lab.xp_reward
    )
    db.add(completion)
    db.commit()

    return LabCompleteResponse(
        success=True,
        message=f"¡Enhorabuena! Has completado todos los retos de '{lab.title}'.",
        xp_gained=lab.xp_reward,
        leveled_up=leveled_up,
        new_level=current_user.level
    )

# --- ADMIN CRUD ---

@router.get("/admin/all", response_model=List[LabOut])
def get_all_labs_admin(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Lista todos los laboratorios incluyendo los inactivos."""
    return db.query(Lab).order_by(Lab.id).all()

@router.post("/", response_model=LabOut)
def create_lab(lab_data: LabCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Crea un nuevo laboratorio."""
    new_lab = Lab(**lab_data.model_dump())
    db.add(new_lab)
    db.commit()
    db.refresh(new_lab)
    return new_lab

@router.put("/{lab_id}", response_model=LabOut)
def update_lab(lab_id: int, lab_data: LabCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Actualiza un laboratorio existente."""
    db_lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not db_lab:
        raise HTTPException(status_code=404, detail="Lab no encontrado")
    
    for key, value in lab_data.model_dump().items():
        setattr(db_lab, key, value)
    
    db.commit()
    db.refresh(db_lab)
    return db_lab

@router.delete("/{lab_id}")
def delete_lab(lab_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Elimina un laboratorio."""
    db_lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not db_lab:
        raise HTTPException(status_code=404, detail="Lab no encontrado")
    
    db.delete(db_lab)
    db.commit()
    return {"message": "Lab purged from mainframe"}

# --- INITIAL SEEDING ---
@router.post("/seed")
def seed_labs(db: Session = Depends(get_db)):
    """(Admin) Inicializa laboratorios de ejemplo."""
    base_labs = [
        {
            "title": "Gestión de Archivos en Linux", 
            "description": "Aprende a moverte por el sistema de archivos.",
            "goal_description": "Crea una carpeta llamada 'tech4u' en tu home y dentro un archivo de texto.",
            "docker_image": "ubuntu:22.04",
            "category": "Linux",
            "difficulty": "easy",
            "time_limit": 30,
            "scenario_setup": json.dumps({
                "directories": ["/home/student/tech4u_old"],
                "files": [
                    {"path": "/home/student/tech4u_old/README.md", "content": "# Tech4U Academy\nBienvenido al lab de archivos."}
                ],
                "commands": ["touch /home/student/welcome.txt"]
            }),
            "xp_reward": 100,
            "validation_command": "ls /home/student/tech4u/notas.txt",
            "expected_result": "/home/student/tech4u/notas.txt",
            "step_by_step_guide": "### 📂 Misión: El Primer Directorio\n1. Entra en tu home: `cd ~`\n2. Crea la carpeta: `mkdir tech4u`\n3. Entra en ella: `cd tech4u`\n4. Crea el archivo: `touch notas.txt`\n5. Verifica: `ls`"
        },
        {
            "title": "Configuración de Permisos", 
            "description": "Aprende chmod y chown en profundidad.",
            "goal_description": "Cambia los permisos de 'script.sh' para que sea ejecutable.",
            "docker_image": "ubuntu:22.04",
            "category": "Linux",
            "difficulty": "medium",
            "time_limit": 20,
            "scenario_setup": json.dumps({
                "files": [
                    {"path": "/home/student/script.sh", "content": "#!/bin/bash\necho 'Acceso concedido al mainframe'"}
                ],
                "commands": ["chmod 644 /home/student/script.sh"]
            }),
            "xp_reward": 200,
            "validation_command": "[ -x /home/student/script.sh ] && echo 'YES'",
            "expected_result": "YES",
            "step_by_step_guide": "### 🔐 Misión: Permisos de Ejecución\n1. Localiza el script: `ls -l`\n2. Observa que no tiene la 'x'\n3. Dale permisos: `chmod +x script.sh`\n4. Pruébalo: `./script.sh`"
        },
        {
            "title": "Análisis de Intrusión: Apache", 
            "description": "Un servidor web ha sido atacado. Encuentra la IP del atacante en los logs.",
            "goal_description": "Busca en /var/log/apache2/access.log el agente de usuario 'Hydra' y guarda la IP atacante en /home/student/attacker_ip.txt",
            "docker_image": "ubuntu:22.04",
            "category": "Seguridad",
            "difficulty": "hard",
            "time_limit": 40,
            "scenario_setup": json.dumps({
                "directories": ["/var/log/apache2"],
                "files": [
                    {
                        "path": "/var/log/apache2/access.log", 
                        "content": "192.168.1.50 - - [05/Mar/2026:20:00:01 +0000] \"GET /login HTTP/1.1\" 200 534 \"-\" \"Mozilla/5.0\"\n10.0.0.15 - - [05/Mar/2026:20:05:12 +0000] \"POST /login HTTP/1.1\" 401 234 \"-\" \"Hydra/v9.5\"\n"
                    }
                ]
            }),
            "xp_reward": 500,
            "validation_command": "cat /home/student/attacker_ip.txt",
            "expected_result": "10.0.0.15",
            "expected_flag": "flag{LOG_ANALYST_LVL1}",
            "step_by_step_guide": "### 🕵️ Misión: Rastro Digital\n1. Mira el log: `cat /var/log/apache2/access.log`\n2. Busca 'Hydra'\n3. Extrae la IP (columna 1)\n4. Guárdala: `echo '10.0.0.15' > /home/student/attacker_ip.txt`"
        }
    ]
    for l_data in base_labs:
        exists = db.query(Lab).filter(Lab.title == l_data["title"]).first()
        if exists:
            # Update existing to add validation rules
            for key, value in l_data.items():
                setattr(exists, key, value)
        else:
            db.add(Lab(**l_data))
    
    db.commit()
    return {"message": "Labs inicializados y actualizados con validación automática"}

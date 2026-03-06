from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
import json
from database import get_db, User, Lab, UserLabCompletion, UserChallengeCompletion, Challenge, SkillPath, Module
from auth import get_current_user, require_admin
from schemas import LabOut, LabCreate, LabCompleteResponse, ChallengeValidationRequest, ChallengeCompletionOut, ChallengeOut, SkillPathOut, ModuleOut
from docker_client import docker_launcher
from datetime import datetime

class ValidationEngine:
    @staticmethod
    def validate(v_type: str, v_value: str, student_input: str, v_extra: str = None, container = None) -> Tuple[bool, str]:
        student_input = student_input.strip() if student_input else ""
        v_value = v_value.strip() if v_value else ""
        
        if v_type == "directory_listing_exact":
            if not student_input:
                return False, "Debes proporcionar los elementos del directorio."
            expected = set(x.strip() for x in v_value.split(","))
            student = set(x.strip() for x in student_input.split(","))
            if expected == student:
                return True, "¡Correcto!"
            return False, "La respuesta debe contener todos los archivos del directorio separados por comas. Ejemplo: archivo1,archivo2,archivo3"
            
        elif v_type == "path_exact":
            if student_input == v_value:
                return True, "¡Correcto!"
            return False, f"Ruta incorrecta. Se esperaba: {v_value}"

        elif v_type == "file_content_flag":
            if student_input == v_value:
                return True, "¡Correcto!"
            return False, "Flag incorrecta. Verifica el contenido del archivo."

        # Types that require container execution
        if not container:
            # For types that MIGHT be solved via input but need state check
            if v_type in ["path_contains", "directory_created", "file_created", "file_exists_in_directory", "permission_set"]:
                return False, "Este reto requiere un sandbox activo para validar."

        if v_type == "path_contains":
            res = container.exec_run("pwd", user="root")
            pwd_out = res.output.decode().strip()
            if v_value in pwd_out:
                return True, "¡Correcto!"
            return False, f"No parece que estés en el directorio correcto. Se esperaba que la ruta contuviera: {v_value}"

        elif v_type == "directory_created" or v_type == "file_created":
            target_dir = v_extra if v_extra else "/home/student"
            res = container.exec_run(f"ls -a {target_dir}", user="root")
            ls_out = res.output.decode().strip().split()
            if v_value in ls_out:
                return True, "¡Correcto!"
            return False, f"No se encontró '{v_value}' en {target_dir}."

        elif v_type == "file_exists_in_directory":
            # v_value is the path to check
            res = container.exec_run(f"ls {v_value}", user="root")
            if res.exit_code == 0:
                return True, "¡Correcto!"
            return False, f"El archivo o directorio '{v_value}' no existe."

        elif v_type == "permission_set":
            # v_value: "600", v_extra: "secret.txt" (path)
            res = container.exec_run(f"stat -c %a {v_extra}", user="root")
            perms = res.output.decode().strip()
            if perms == v_value:
                return True, "¡Correcto!"
            return False, f"Permisos incorrectos para {v_extra}. Se esperaba: {v_value}"

        return False, "Tipo de validación no soportado o datos insuficientes."

router = APIRouter(prefix="/labs", tags=["Science Labs"])

@router.get("/paths", response_model=List[SkillPathOut])
def list_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available skill paths."""
    return db.query(SkillPath).order_by(SkillPath.order_index).all()

@router.get("/paths/{path_id}/modules", response_model=List[ModuleOut])
def list_modules_by_path(
    path_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all modules within a specific skill path."""
    return db.query(Module).filter(Module.skill_path_id == path_id).order_by(Module.order_index).all()

@router.get("/modules/{module_id}/labs", response_model=List[LabOut])
def list_labs_by_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all labs within a specific module, with sequential status."""
    labs = db.query(Lab).filter(
        Lab.module_id == module_id,
        Lab.is_active == True
    ).order_by(Lab.id).all()
    
    prev_lab_completed = True
    for lab in labs:
        completion = db.query(UserLabCompletion).filter(
            UserLabCompletion.user_id == current_user.id,
            UserLabCompletion.lab_id == lab.id
        ).first()
        lab.is_completed = True if completion else False
        lab.is_unlocked = prev_lab_completed
        prev_lab_completed = lab.is_completed
        
    return labs

@router.get("/", response_model=List[LabOut])
def list_labs_student(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active labs (Legacy / Global View)."""
    labs = db.query(Lab).filter(Lab.is_active == True).order_by(Lab.id).all()
    
    prev_lab_completed = True
    for lab in labs:
        completion = db.query(UserLabCompletion).filter(
            UserLabCompletion.user_id == current_user.id,
            UserLabCompletion.lab_id == lab.id
        ).first()
        lab.is_completed = True if completion else False
        lab.is_unlocked = prev_lab_completed
        prev_lab_completed = lab.is_completed
        
    return labs

@router.get("/{lab_id}", response_model=LabOut)
def get_lab_student(
    lab_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details for a single lab."""
    lab = db.query(Lab).filter(Lab.id == lab_id, Lab.is_active == True).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    
    # Set completion status for the frontend
    completion = db.query(UserLabCompletion).filter(
        UserLabCompletion.user_id == current_user.id,
        UserLabCompletion.lab_id == lab.id
    ).first()
    lab.is_completed = True if completion else False
    
    # Check if it's unlocked (re-using sequential logic briefly)
    # For a detail view, we assume the user got here from the list where it was unlocked,
    # but we should still set the flag for the UI.
    prev_lab = db.query(Lab).filter(Lab.id < lab.id, Lab.is_active == True).order_by(Lab.id.desc()).first()
    if not prev_lab:
        lab.is_unlocked = True
    else:
        prev_completion = db.query(UserLabCompletion).filter(
            UserLabCompletion.user_id == current_user.id,
            UserLabCompletion.lab_id == prev_lab.id
        ).first()
        lab.is_unlocked = True if prev_completion else False

    # 3. Load challenges and check completion
    challenges = db.query(Challenge).filter(Challenge.lab_id == lab_id).order_by(Challenge.order_index).all()
    completions = db.query(UserChallengeCompletion).filter(
        UserChallengeCompletion.user_id == current_user.id,
        UserChallengeCompletion.lab_id == lab_id
    ).all()
    completed_ids = {c.challenge_id for c in completions}
    
    for c in challenges:
        c.is_completed = c.id in completed_ids
    
    lab.challenges = challenges
    return lab

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

@router.get("/{lab_id}/utils/ls", response_model=dict)
def ls_utility(
    lab_id: int,
    path: Optional[str] = "/home/student",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Utility to help students see directory content without having to validate."""
    containers = docker_launcher.get_active_containers_for_user(current_user.id)
    if not containers:
        raise HTTPException(status_code=400, detail="Sandbox no activo.")
    
    container = containers[0]
    res = container.exec_run(f"ls -a {path}", user="root")
    content = res.output.decode().strip()
    return {"path": path, "content": content}

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

    # 2. Get Challenge record
    challenge = db.query(Challenge).filter(
        Challenge.lab_id == lab_id,
        Challenge.id == req.challenge_id
    ).first()
    
    if not challenge:
        # Check if it exists in legacy JSON (transitional)
        lab = db.query(Lab).filter(Lab.id == lab_id).first()
        if lab and lab.validation_rules:
            rules_data = json.loads(lab.validation_rules)
            challenges_json = rules_data.get("challenges", [])
            challenge_json = next((c for c in challenges_json if str(c.get("id")) == req.challenge_id), None)
            if challenge_json:
                # Mock a challenge object for the engine
                from collections import namedtuple
                MockChallenge = namedtuple('MockChallenge', ['validation_type', 'validation_value', 'validation_extra', 'xp'])
                challenge = MockChallenge(
                    validation_type="directory_listing_exact", # Default for legacy
                    validation_value=challenge_json.get("expected_value"),
                    validation_extra=None,
                    xp=10
                )
    
    if not challenge:
        raise HTTPException(status_code=404, detail="Reto no encontrado")

    # 3. Validation Logic
    containers = docker_launcher.get_active_containers_for_user(current_user.id)
    container = containers[0] if containers else None
    
    success, message = ValidationEngine.validate(
        challenge.validation_type,
        challenge.validation_value,
        req.student_input,
        challenge.validation_extra,
        container
    )
    
    if success:
        new_comp = UserChallengeCompletion(
            user_id=current_user.id,
            lab_id=lab_id,
            challenge_id=req.challenge_id
        )
        db.add(new_comp)
        
        # Award XP if it's a real challenge
        if hasattr(challenge, 'xp'):
            current_user.xp = (current_user.xp or 0) + challenge.xp
            
        db.commit()
        return {"success": True, "message": message}
    else:
        return {"success": False, "message": message}

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

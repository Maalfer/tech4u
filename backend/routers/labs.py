from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
import json
import logging
from database import get_db, User, Lab, UserLabCompletion, UserChallengeCompletion, Challenge, SkillPath, Module
from auth import get_current_user, require_admin
from schemas import (
    LabOut, LabCreate, LabCompleteResponse, ChallengeValidationRequest,
    ChallengeCompletionOut, ChallengeOut, SkillPathOut, ModuleOut,
    SkillPathCreate, ModuleCreate, TerminalStartResponse,
    LabGeneratorPayload
)
from limiter import limiter
from fastapi import Request
from docker_client import docker_launcher
from datetime import datetime

logger = logging.getLogger(__name__)

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

router = APIRouter(prefix="/labs", tags=["Gestión de Laboratorios"])

@router.get("/ping")
def ping():
    return {"status": "labs router alive"}

@router.get("/paths", response_model=List[SkillPathOut])
def list_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available skill paths."""
    query = db.query(SkillPath).order_by(SkillPath.order_index)
    if current_user.role != "admin":
        query = query.filter(SkillPath.is_active == True)
    return query.all()

@router.get("/paths/{path_id}/modules", response_model=List[ModuleOut])
def list_modules_by_path(
    path_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all modules within a specific skill path."""
    query = db.query(Module).filter(Module.skill_path_id == path_id).order_by(Module.order_index)
    if current_user.role != "admin":
        query = query.filter(Module.is_active == True)
    return query.all()

@router.get("/modules/{module_id}/labs", response_model=List[LabOut])
def list_labs_by_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all labs within a specific module, with sequential status."""
    labs = db.query(Lab).filter(
        Lab.module_id == module_id
    ).order_by(Lab.order_index, Lab.id).all()
    
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

@router.post("/generate", response_model=LabOut)
def generate_lab(data: LabGeneratorPayload, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Generates a complete lab with challenges safely."""
    try:
        lab = Lab(
            title=data.title,
            module_id=data.module_id,
            difficulty=data.difficulty,
            xp_reward=data.base_xp,
            description=data.description or "Draft lab created by generator.",
            goal_description=data.goal_description or "Objectives will be added later.",
            step_by_step_guide=data.step_by_step_guide or "Guide will be added later.",
            order_index=data.order_index or 0,
            is_active=False,
            time_limit=30,
            category="Linux",
            docker_image="ubuntu:22.04"
        )
        db.add(lab)
        db.flush() # flush to get lab.id for challenges

        for i in range(data.num_challenges):
            c_data = data.challenges[i] if i < len(data.challenges) else None
            title = c_data.title if c_data else f"Reto {i+1}"
            desc = c_data.description if c_data else "Completa la tarea asignada para superar este reto."
            xp = c_data.xp_reward if c_data else 50
            
            # Generate ID consistent with current logic
            challenge_id = f"L{lab.id}_C{i+1}"
            challenge = Challenge(
                id=challenge_id,
                lab_id=lab.id,
                title=title,
                description=desc,
                xp=xp,
                order_index=i,
                validation_type="custom",
                validation_value="",
                validation_extra="echo 'Validación pendiente'"
            )
            db.add(challenge)

        db.commit()
        db.refresh(lab)
        return lab
    except Exception as e:
        db.rollback()
        logger.error(f"LAB GENERATOR ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    """Valida un reto específico dentro de un laboratorio (TEMPORALMENTE DESACTIVADO)."""
    return {"success": True, "message": "Validation system temporarily disabled."}

@router.post("/{lab_id}/complete", response_model=LabCompleteResponse)
def complete_lab(
    lab_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Finaliza el lab (VALIDACIÓN BYPASSED).
    """
    # Get Lab info
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab no encontrado")

    # 4. Terminal Labs NO dan XP — son ejercicios prácticos de refuerzo,
    #    no actividades de evaluación. El XP se gana en Exámenes y Skill Labs.
    xp_gained = 0
    leveled_up = False  # add_xp no se llama, nivel no cambia

    completion = UserLabCompletion(
        user_id=current_user.id,
        lab_id=lab.id,
        xp_gained=xp_gained
    )
    db.add(completion)
    db.commit()

    return LabCompleteResponse(
        success=True,
        message=f"¡Enhorabuena! Has completado todos los retos de '{lab.title}'.",
        xp_gained=xp_gained,
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
    """(Admin) Crea un nuevo laboratorio y sincroniza retos."""
    new_lab = Lab(**lab_data.model_dump())
    db.add(new_lab)
    db.commit()
    db.refresh(new_lab)
    
    # Sincronizar retos si vienen en validation_rules
    if new_lab.validation_rules:
        sync_lab_challenges(new_lab.id, new_lab.validation_rules, db)
        
    return new_lab

def sync_lab_challenges(lab_id: int, rules_json: str, db: Session):
    """Sincroniza la tabla terminal_challenges con el JSON de validation_rules."""
    try:
        data = json.loads(rules_json)
        challenges_data = data.get("challenges", [])
        
        # Eliminar retos actuales para este lab para evitar conflictos de ID si han cambiado
        db.query(Challenge).filter(Challenge.lab_id == lab_id).delete()
        
        for idx, c_data in enumerate(challenges_data):
            # Mapear campos del JSON visual a la tabla Challenge
            # c_data suele tener { id: number, title: string, description: string, rules: [{command, expected}] }
            # Pero el modelo Challenge espera validation_type, validation_value, etc.
            
            # Si el JSON viene con rules, usamos la primera regla para validation_type por simplicidad o concatenamos
            # La arquitectura premium debería idealmente manejar esto mejor.
            
            v_type = "directory_listing_exact"
            v_value = ""
            v_extra = None
            
            if c_data.get("rules") and len(c_data["rules"]) > 0:
                # Tomamos la primera regla como principal para retrocompatibilidad con el motor simple
                first_rule = c_data["rules"][0]
                v_value = first_rule.get("expected", "")
                v_extra = first_rule.get("command", "")
            
            # Si el JSON ya trae v_type/v_value (de los seeds), usarlos
            if c_data.get("v_type"):
                v_type = c_data["v_type"]
                v_value = c_data["v_value"]
                v_extra = c_data.get("v_extra")

            new_c = Challenge(
                id=f"L{lab_id}_C{idx+1}", # Generar ID consistente
                lab_id=lab_id,
                title=c_data.get("title", f"Reto {idx+1}"),
                description=c_data.get("description", ""),
                validation_type=v_type,
                validation_value=v_value,
                validation_extra=v_extra,
                order_index=idx,
                xp=10
            )
            db.add(new_c)
        db.commit()
    except Exception as e:
        logger.error(f"Error syncing challenges: {e}")
        db.rollback()

@router.put("/{lab_id}", response_model=LabOut)
def update_lab(lab_id: int, lab_data: LabCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Actualiza un laboratorio existente y sincroniza retos."""
    db_lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not db_lab:
        raise HTTPException(status_code=404, detail="Lab no encontrado")
    
    for key, value in lab_data.model_dump().items():
        setattr(db_lab, key, value)
    
    db.commit()
    
    # Sincronizar retos si el JSON ha cambiado
    if db_lab.validation_rules:
        sync_lab_challenges(lab_id, db_lab.validation_rules, db)
        
    db.refresh(db_lab)
    return db_lab

@router.delete("/{lab_id}")
def delete_lab(lab_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Elimina un laboratorio y sus registros de completado."""
    db_lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not db_lab: raise HTTPException(status_code=404)
    # Borrar registros de completado que referencian este lab (sin cascade en la FK)
    db.query(UserChallengeCompletion).filter(UserChallengeCompletion.lab_id == lab_id).delete()
    db.query(UserLabCompletion).filter(UserLabCompletion.lab_id == lab_id).delete()
    db.delete(db_lab)
    db.commit()
    return {"message": "Lab purged from mainframe"}

@router.patch("/{lab_id}/toggle", response_model=LabOut)
def toggle_lab_visibility(lab_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not db_lab: raise HTTPException(status_code=404)
    db_lab.is_active = not db_lab.is_active
    db.commit()
    db.refresh(db_lab)
    return db_lab

@router.post("/{lab_id}/start", response_model=TerminalStartResponse)
@limiter.limit("5/minute")
async def start_lab_endpoint(
    lab_id: int, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce limit: 1 lab per user
    active_containers = docker_launcher.get_active_containers_for_user(current_user.id)
    if len(active_containers) >= 1:
        docker_launcher.kill_all_for_user(current_user.id)
    
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
        
    container = docker_launcher.start_lab_container(
        current_user.id, 
        lab_id, 
        lab.docker_image,
        scenario_setup=lab.scenario_setup
    )
    
    return {
        "container_id": container.id,
        "ws_url": f"/ws/terminal/{container.id}"
    }

@router.post("/{lab_id}/restart", response_model=TerminalStartResponse)
async def restart_lab_endpoint(
    lab_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kills current user lab and starts a fresh one."""
    docker_launcher.kill_all_for_user(current_user.id)
    return await start_lab_endpoint(lab_id, None, db, current_user)


# --- SKILL PATH ADMIN ---

@router.post("/admin/paths", response_model=SkillPathOut)
def create_skill_path(path_data: SkillPathCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_path = SkillPath(**path_data.model_dump())
    db.add(new_path)
    db.commit()
    db.refresh(new_path)
    return new_path

@router.put("/admin/paths/{path_id}", response_model=SkillPathOut)
def update_skill_path(path_id: int, path_data: SkillPathCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_path = db.query(SkillPath).filter(SkillPath.id == path_id).first()
    if not db_path: raise HTTPException(status_code=404, detail="Ruta no encontrada")
    for k, v in path_data.model_dump().items():
        setattr(db_path, k, v)
    db.commit()
    db.refresh(db_path)
    return db_path

@router.patch("/admin/paths/{path_id}/toggle", response_model=SkillPathOut)
def toggle_skill_path(path_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_path = db.query(SkillPath).filter(SkillPath.id == path_id).first()
    if not db_path: raise HTTPException(status_code=404)
    db_path.is_active = not db_path.is_active
    db.commit()
    db.refresh(db_path)
    return db_path

@router.delete("/admin/paths/{path_id}")
def delete_skill_path(path_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Elimina un SkillPath en cascada: módulos → labs → completados."""
    db_path = db.query(SkillPath).filter(SkillPath.id == path_id).first()
    if not db_path: raise HTTPException(status_code=404)
    # Recoger todos los lab_ids del path para borrar sus completados
    lab_ids = [
        lab.id
        for module in db_path.modules
        for lab in module.labs
    ]
    if lab_ids:
        db.query(UserChallengeCompletion).filter(UserChallengeCompletion.lab_id.in_(lab_ids)).delete(synchronize_session=False)
        db.query(UserLabCompletion).filter(UserLabCompletion.lab_id.in_(lab_ids)).delete(synchronize_session=False)
    db.delete(db_path)
    db.commit()
    return {"message": "Skill Path deleted"}

# --- MODULE ADMIN ---

@router.post("/admin/modules", response_model=ModuleOut)
def create_module(module_data: ModuleCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_module = Module(**module_data.model_dump())
    db.add(new_module)
    db.commit()
    db.refresh(new_module)
    return new_module

@router.put("/admin/modules/{module_id}", response_model=ModuleOut)
def update_module(module_id: int, module_data: ModuleCreate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module: raise HTTPException(status_code=404, detail="Módulo no encontrado")
    for k, v in module_data.model_dump().items():
        setattr(db_module, k, v)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.patch("/admin/modules/{module_id}/toggle-validation", response_model=ModuleOut)
def toggle_module_validation(module_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module: raise HTTPException(status_code=404)
    db_module.requires_validation = not db_module.requires_validation
    db.commit()
    db.refresh(db_module)
    return db_module

@router.patch("/admin/modules/{module_id}/toggle-visibility", response_model=ModuleOut)
def toggle_module_visibility(module_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module: raise HTTPException(status_code=404)
    db_module.is_active = not db_module.is_active
    db.commit()
    db.refresh(db_module)
    return db_module

@router.delete("/admin/modules/{module_id}")
def delete_module(module_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """(Admin) Elimina un módulo en cascada: labs → completados."""
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module: raise HTTPException(status_code=404)
    lab_ids = [lab.id for lab in db_module.labs]
    if lab_ids:
        db.query(UserChallengeCompletion).filter(UserChallengeCompletion.lab_id.in_(lab_ids)).delete(synchronize_session=False)
        db.query(UserLabCompletion).filter(UserLabCompletion.lab_id.in_(lab_ids)).delete(synchronize_session=False)
    db.delete(db_module)
    db.commit()
    return {"message": "Module deleted"}

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

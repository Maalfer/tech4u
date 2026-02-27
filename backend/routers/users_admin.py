from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, User
from auth import require_admin, hash_password
from schemas import UserOut, UserRoleUpdate, UserPasswordUpdate

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])


@router.get("/", response_model=List[UserOut])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Devuelve todos los usuarios registrados."""
    return db.query(User).all()


@router.put("/{user_id}/role", response_model=UserOut)
def update_role(
    user_id: int,
    data: UserRoleUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Actualiza el rol de un usuario."""
    if data.role not in ["admin", "docente", "alumno"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/password", response_model=dict)
def update_password(
    user_id: int,
    data: UserPasswordUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Cambia la contraseña de cualquier usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Elimina a un usuario."""
    if current_admin.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

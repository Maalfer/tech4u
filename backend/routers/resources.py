from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db, Resource, User
from auth import get_current_user, require_admin

router = APIRouter(prefix="/resources", tags=["Resources"])


# ── ADMIN: ver todos los recursos (borrador + publicados) ─────────────────────

@router.get("/admin/all")
def admin_get_all_resources(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Lista todos los recursos con su estado de publicación."""
    resources = db.query(Resource).order_by(Resource.id.desc()).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "subject": r.subject,
            "description": r.description,
            "file_type": r.file_type,
            "url": r.url,
            "requires_subscription": r.requires_subscription,
            "is_published": r.is_published,
        }
        for r in resources
    ]


@router.patch("/{resource_id}/toggle-publish")
def toggle_publish(
    resource_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Publica o despublica un recurso."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    resource.is_published = not resource.is_published
    db.commit()
    return {"id": resource.id, "is_published": resource.is_published}


# ── ALUMNOS: sólo recursos publicados ────────────────────────────────────────

@router.get("/")
def get_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna SÓLO recursos publicados.
    Si el usuario tiene plan de pago activo, desbloquea todo.
    """
    resources = db.query(Resource).filter(Resource.is_published == True).all()
    visible_resources = []

    # 1. DETERMINAR SI ES USUARIO DE PAGO
    # Convertimos a minúsculas para que 'Anual' o 'anual' funcionen igual
    sub_type = current_user.subscription_type.lower() if current_user.subscription_type else "free"
    
    is_premium_active = False
    
    if sub_type != "free":
        # Si tiene plan de pago, verificamos la fecha de vencimiento
        if current_user.subscription_end:
            # Comparamos fechas (ahora mismo vs fecha de fin)
            if current_user.subscription_end > datetime.utcnow():
                is_premium_active = True
        else:
            # Si no tiene fecha fin pero el tipo es distinto de free, le damos acceso
            is_premium_active = True

    # 2. CONSTRUIR RESPUESTA
    for resource in resources:
        # Por defecto bloqueado
        final_url = None
        
        # CONDICIONES DE DESBLOQUEO:
        # A) El recurso es abierto (requires_subscription = False)
        # B) El usuario es Premium Activo
        if not resource.requires_subscription or is_premium_active:
            final_url = resource.url

        visible_resources.append({
            "id": resource.id,
            "title": resource.title,
            "description": resource.description,
            "subject": resource.subject,
            "file_type": resource.file_type,
            "requires_subscription": resource.requires_subscription,
            "url": final_url 
        })

    return visible_resources


@router.get("/{resource_id}")
def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna un recurso individual para el viewer.
    Aplica la misma lógica de acceso que el listado.
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")

    sub_type = (current_user.subscription_type or "free").lower()
    is_premium = sub_type != "free" and (
        not current_user.subscription_end or
        current_user.subscription_end > datetime.utcnow()
    )

    final_url = resource.url if (not resource.requires_subscription or is_premium) else None

    return {
        "id": resource.id,
        "title": resource.title,
        "description": resource.description,
        "subject": resource.subject,
        "file_type": (resource.file_type or "").upper(),
        "requires_subscription": resource.requires_subscription,
        "url": final_url,
        "is_locked": final_url is None,
    }
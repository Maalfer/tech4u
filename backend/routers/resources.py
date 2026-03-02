from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db, Resource, User
from auth import get_current_user

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.get("/")
def get_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna recursos. 
    Si el usuario tiene cualquier plan que NO sea 'free', desbloquea TODO.
    """
    resources = db.query(Resource).all()
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
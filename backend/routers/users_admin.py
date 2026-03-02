from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db, User, Ticket, Question
from auth import require_admin, hash_password
from schemas import (
    UserOut, UserRoleUpdate, UserPasswordUpdate, 
    UserSubscriptionUpdate, TicketOut, AdminDashboardStats
)
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

# --- NUEVO: DASHBOARD DE GESTIÓN ESTRATÉGICA ---

@router.get("/dashboard-stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Recopila métricas de negocio y actividad para el Dashboard de gestión."""
    
    # 1. Contadores básicos
    total_users = db.query(User).count()
    active_subs = db.query(User).filter(User.subscription_type != "free").count()
    pending_tickets = db.query(Ticket).filter(Ticket.status == "pendiente").count()
    total_questions = db.query(Question).count()
    
    # 2. Usuarios por Rol
    roles_data = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    users_by_role = {role: count for role, count in roles_data}
    
    # 3. Estimación de ingresos (Lógica basada en tipos de suscripción)
    # Asumiendo precios: monthly(10), quarterly(25), annual(80)
    revenue = 0.0
    revenue += db.query(User).filter(User.subscription_type == "monthly").count() * 10.0
    revenue += db.query(User).filter(User.subscription_type == "quarterly").count() * 25.0
    revenue += db.query(User).filter(User.subscription_type == "annual").count() * 80.0
    
    # 4. Datos simulados para gráficas (Historial y Picos)
    # En una app real, esto consultaría tablas de logs o facturación
    revenue_history = [revenue * 0.7, revenue * 0.8, revenue * 0.9, revenue * 0.95, revenue]
    login_peaks = [12, 45, 120, 80, 55, 90, 110] # Usuarios concurrentes última semana
    
    return {
        "total_users": total_users,
        "active_subscriptions": active_subs,
        "revenue_this_month": round(revenue, 2),
        "pending_tickets": pending_tickets,
        "total_questions": total_questions,
        "users_by_role": users_by_role,
        "revenue_history": revenue_history,
        "login_peaks": login_peaks
    }

# --- GESTIÓN DE USUARIOS ---

@router.get("/", response_model=List[UserOut])
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Devuelve todos los usuarios registrados."""
    return db.query(User).all()

@router.patch("/{user_id}/subscription", response_model=UserOut)
def update_subscription(
    user_id: int,
    data: UserSubscriptionUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Cambia el plan de suscripción y calcula la fecha de fin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.subscription_type = data.subscription_type
    
    now = datetime.utcnow()
    if data.subscription_type == "lifetime":
        user.subscription_end = None
    elif data.subscription_type == "monthly":
        user.subscription_end = now + timedelta(days=30)
    elif data.subscription_type == "quarterly":
        user.subscription_end = now + timedelta(days=90)
    elif data.subscription_type == "annual":
        user.subscription_end = now + timedelta(days=365)
    else: 
        user.subscription_end = None
        
    db.commit()
    db.refresh(user)
    return user

# --- GESTIÓN DE TICKETS ---

@router.get("/tickets", response_model=List[TicketOut])
def get_admin_tickets(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()

@router.get("/tickets/count")
def get_tickets_count(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    count = db.query(Ticket).filter(Ticket.status == "pendiente").count()
    return {"count": count}

@router.patch("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    data: dict,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket.status = data.get("status", "pendiente")
    db.commit()
    db.refresh(ticket)
    return {"message": "Estado del ticket actualizado con éxito"}

@router.delete("/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket eliminado correctamente"}

@router.put("/{user_id}/role", response_model=UserOut)
def update_role(
    user_id: int,
    data: UserRoleUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if data.role not in ["admin", "docente", "alumno"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if current_admin.id == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(user)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

# --- Añadir a routers/users_admin.py ---

@router.post("/announcements")
def create_announcement(data: dict, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    new_ann = Announcement(content=data.get("content"))
    db.add(new_ann)
    db.commit()
    return {"message": "Anuncio global publicado"}

@router.get("/billing-breakdown")
def get_billing_breakdown(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    # Desglose real para las gráficas circulares
    monthly = db.query(User).filter(User.subscription_type == "monthly").count()
    annual = db.query(User).filter(User.subscription_type == "annual").count()
    quarterly = db.query(User).filter(User.subscription_type == "quarterly").count()
    
    return {
        "monthly": monthly * 10,
        "annual": annual * 80,
        "quarterly": quarterly * 25,
        "total": (monthly * 10) + (annual * 80) + (quarterly * 25),
        "target": 5000.0 # Tu objetivo mensual
    }

@router.get("/suggestions")
def get_suggestions(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(QuestionSuggestion).filter(QuestionSuggestion.status == "pendiente").all()
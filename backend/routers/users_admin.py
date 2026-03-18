from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db, User, Ticket, Question, Announcement, QuestionSuggestion, TicketMessage
from auth import require_admin, require_developer, hash_password
from schemas import (
    UserOut, UserRoleUpdate, UserPasswordUpdate, 
    UserSubscriptionUpdate, TicketOut, AdminDashboardStats,
    AdminUserCreate, TicketMessageCreate, TicketMessageOut, TicketUserInfoOut,
    TicketUpdate, AdminPasswordReset, AdminProfileUpdate, AdminSetShields,
    AdminModifyXP, AdminSetStreak, AnnouncementCreate, PaginatedUserOut
)
from utils.pagination import paginate_query
from datetime import datetime, timedelta
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

# --- NUEVO: DASHBOARD DE GESTIÓN ESTRATÉGICA ---

@router.get("/dashboard-stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    _: User = Depends(require_developer),
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

@router.get("/", response_model=PaginatedUserOut)
def list_users(
    limit: int = 50,
    offset: int = 0,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db),
):
    """(Admin) Devuelve usuarios registrados con paginación."""
    query = db.query(User).order_by(User.id.desc())
    return paginate_query(query, limit, offset)

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
        user.streak_protections = 4 # 🛡️ Shield bonus
    else: 
        user.subscription_end = None
        
    db.commit()
    db.refresh(user)
    return user

# --- GESTIÓN DE TICKETS ---

@router.get("/tickets", response_model=List[TicketOut])
def get_admin_tickets(
    _: User = Depends(require_developer),
    db: Session = Depends(get_db),
):
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
    results = []
    
    for t in tickets:
        u = t.user
        user_info = None
        if u:
            user_info = TicketUserInfoOut(
                nombre=u.nombre,
                email=u.email,
                role=u.role,
                subscription_type=u.subscription_type,
                streak_count=u.streak_count,
                streak_protections=u.streak_protections,
                months_subscribed=u.months_subscribed,
                subscription_end=u.subscription_end
            )
        
        # Pydantic allows returning dicts matching the schema
        results.append({
            "id": t.id,
            "user_id": t.user_id,
            "subject": t.subject,
            "description": t.description,
            "status": t.status,
            "admin_reply": t.admin_reply,
            "replied_at": t.replied_at,
            "created_at": t.created_at,
            "messages": t.messages,
            "user_info": user_info
        })
        
    return results

@router.get("/tickets/count")
def get_tickets_count(
    _: User = Depends(require_developer),
    db: Session = Depends(get_db),
):
    count = db.query(Ticket).filter(Ticket.status == "pendiente").count()
    return {"count": count}

@router.patch("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    data: TicketUpdate,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    if data.status:
        ticket.status = data.status
    if data.admin_reply is not None:
        ticket.admin_reply = data.admin_reply
        ticket.replied_at = datetime.utcnow()
        
    db.commit()
    db.refresh(ticket)
    return {"message": "Ticket actualizado con éxito"}

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

@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageOut)
def admin_reply_to_ticket(
    ticket_id: int,
    data: TicketMessageCreate,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Envía un mensaje en el hilo del ticket y notifica su estado sin cerrarlo."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_role="admin",
        content=data.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.get("/{user_id}/profile", response_model=TicketUserInfoOut)
def get_user_detailed_profile(
    user_id: int,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Obtiene el perfil ampliado de un usuario."""
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return TicketUserInfoOut(
        nombre=u.nombre,
        email=u.email,
        role=u.role,
        subscription_type=u.subscription_type,
        streak_count=u.streak_count,
        streak_protections=u.streak_protections,
        months_subscribed=u.months_subscribed,
        subscription_end=u.subscription_end
    )

@router.put("/{user_id}/role", response_model=UserOut)
def update_role(
    user_id: int,
    data: UserRoleUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if data.role not in ["admin", "developer", "docente", "alumno"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    current_admin = _ # Renaming for clarity from dependency
    if data.role in ["admin", "developer"] and current_admin.role != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede asignar roles de gestión críticos.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    user.role = data.role
    db.commit()
    db.refresh(user)
    return user

@router.post("/", response_model=UserOut)
def create_user_admin(
    data: AdminUserCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Crea un nuevo usuario manualmente."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    new_user = User(
        nombre=data.nombre,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        subscription_type=data.subscription_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

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

@router.put("/{user_id}/password", response_model=UserOut)
def reset_password_admin(
    user_id: int,
    data: AdminPasswordReset,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Restablece la contraseña de un usuario manualmente."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.password_hash = hash_password(data.password)
    # SEC-11 FIX: invalidar tokens activos del usuario al cambiar su contraseña desde admin
    user.token_version = (user.token_version or 0) + 1
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/profile", response_model=UserOut)
def update_profile_admin(
    user_id: int,
    data: AdminProfileUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Edita nombre y email del usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if data.nombre: 
        user.nombre = data.nombre
    if data.email:
        # Verificar si el email ya existe en otro usuario
        existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = data.email
        
    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/bonus", response_model=UserOut)
def grant_streak_bonus(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Otorga 4 protecciones de racha al usuario."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    user.streak_count = user.streak_count if user.streak_count else 0 # Asegurar init
    user.streak_protections = (user.streak_protections or 0) + 4
    
    db.commit()
    db.refresh(user)
    return user

# --- Full user detail for admin management page ---

@router.get("/{user_id}/full")
def get_user_full_detail(
    user_id: int,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Returns all user fields for the management page."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id": user.id,
        "nombre": user.nombre,
        "email": user.email,
        "role": user.role,
        "subscription_type": user.subscription_type,
        "subscription_start": str(user.subscription_start) if user.subscription_start else None,
        "subscription_end": str(user.subscription_end) if user.subscription_end else None,
        "stripe_subscription_id": None,
        "xp": user.xp or 0,
        "level": user.level or 1,
        "streak_count": user.streak_count or 0,
        "streak_protections": user.streak_protections or 0,
        "months_subscribed": user.months_subscribed or 0,
        "last_login": str(user.last_login) if user.last_login else None,
        "created_at": str(user.created_at) if user.created_at else None,
        "is_active": True,
        "referral_code": user.referral_code,
        "referral_reward_count": user.referral_reward_count or 0,
        "pending_10p_discounts": user.pending_10p_discounts or 0,
        "free_months_accumulated": user.free_months_accumulated or 0,
    }

@router.patch("/{user_id}/shields")
def set_user_shields(
    user_id: int,
    data: AdminSetShields,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Set the exact number of streak shields for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.streak_protections = data.shields
    db.commit()
    db.refresh(user)
    return {"message": f"Escudos actualizados a {data.shields}", "streak_protections": user.streak_protections}

@router.patch("/{user_id}/xp")
def modify_user_xp(
    user_id: int,
    data: AdminModifyXP,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Set XP to an exact value."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # ── Conversión XP total → (nivel, xp_restante) ──────────────────
    # Usa la misma curva que database.py::get_next_level_xp para que
    # el panel admin y el juego estén siempre sincronizados.
    #   Niveles  1-5 :  800 XP/nivel
    #   Niveles  6-10: 1500 XP/nivel
    #   Niveles 11-15: 2500 XP/nivel
    #   Niveles 16-19: 4000 XP/nivel  (total máx: 40 000 XP)
    # data.xp se interpreta como XP TOTAL ganado por el alumno.
    # ─────────────────────────────────────────────────────────────────
    def _xp_per_level(lvl: int) -> int:
        if lvl <= 5:  return 800
        if lvl <= 10: return 1500
        if lvl <= 15: return 2500
        if lvl <= 19: return 4000
        return 99999

    remaining = max(0, data.xp)
    computed_level = 1
    while computed_level < 20:
        needed = _xp_per_level(computed_level)
        if remaining >= needed:
            remaining -= needed
            computed_level += 1
        else:
            break

    user.level = min(computed_level, 20)
    user.xp    = remaining if user.level < 20 else 0

    db.commit()
    db.refresh(user)
    return {
        "message": f"XP total {data.xp} → Nivel {user.level} con {user.xp} XP en el nivel actual",
        "xp": user.xp,
        "level": user.level,
        "total_xp_set": data.xp,
    }

@router.patch("/{user_id}/streak")
def reset_user_streak(
    user_id: int,
    data: AdminSetStreak,
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Set streak to an exact value."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.streak_count = data.streak
    db.commit()
    db.refresh(user)
    return {"message": f"Racha actualizada a {user.streak_count}", "streak_count": user.streak_count}

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

@router.patch("/suggestions/{suggestion_id}/approve")
def approve_suggestion(suggestion_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    """
    (Admin) Aprueba una sugerencia creando una pregunta preliminar en el banco.
    Las opciones se marcan como pendientes de completar por el admin en el editor de preguntas.
    """
    sug = db.query(QuestionSuggestion).filter(QuestionSuggestion.id == suggestion_id).first()
    if not sug:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")
    # Crear pregunta con datos de la sugerencia; las opciones quedan marcadas para revisión
    new_q = Question(
        subject=sug.subject,
        text=sug.text,
        option_a="[Pendiente — completar en editor de preguntas]",
        option_b="[Pendiente]",
        option_c="[Pendiente]",
        option_d="[Pendiente]",
        correct_answer="a",
        difficulty="media",
        explanation=f"Pregunta aprobada desde sugerencia #{sug.id}. Completar opciones en el panel de preguntas.",
        approved=False  # No activar hasta que el admin complete las opciones
    )
    db.add(new_q)
    sug.status = "aprobada"
    db.commit()
    db.refresh(new_q)
    return {"message": "Sugerencia aprobada. Completa las opciones en el editor de preguntas.", "question_id": new_q.id}

@router.delete("/suggestions/{suggestion_id}")
def delete_suggestion(suggestion_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    sug = db.query(QuestionSuggestion).filter(QuestionSuggestion.id == suggestion_id).first()
    if not sug:
        raise HTTPException(status_code=404, detail="Sugerencia no encontrada")
    db.delete(sug)
    db.commit()
    return {"ok": True, "message": "Sugerencia eliminada"}

@router.get("/referral-ecosystem")
def get_referral_ecosystem(
    _: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """(Admin) Monitorización y detección de fraude en el sistema de referidos."""
    # Usuarios que han invitado a alguien
    referrers = db.query(User).filter(User.referral_reward_count > 0).all()
    
    results = []
    for u in referrers:
        # Detectar sospechas
        warnings = []
        if u.pending_10p_discounts > 10:
            warnings.append("Más de 10 cupones del 10% acumulados")
        
        # Lógica de fraude: Muchas invitaciones pero ninguna suscripción activa en los invitados (opcional, para después)
        # Por ahora, alertar si tiene muchos referidos totales
        if u.referral_reward_count > 20:
            warnings.append("Volumen de referidos inusualmente alto (>20)")

        results.append({
            "user_id": u.id,
            "nombre": u.nombre,
            "email": u.email,
            "referral_code": u.referral_code,
            "referral_reward_count": u.referral_reward_count,
            "pending_10p_discounts": u.pending_10p_discounts,
            "free_months_accumulated": u.free_months_accumulated,
            "warnings": warnings,
            "risk_level": "alto" if len(warnings) > 1 else ("medio" if len(warnings) == 1 else "bajo")
        })
    
    # Ordenar por nivel de riesgo y luego por cantidad de referidos
    results.sort(key=lambda x: (x["risk_level"] == "bajo", x["risk_level"] == "medio", -x["referral_reward_count"]))
    
    return results

@router.patch("/{user_id}/reset-referrals")
def reset_user_referrals(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """(Admin) Resetea los contadores de referidos de un usuario sospechoso."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.pending_10p_discounts = 0
    user.free_months_accumulated = 0
    # No reseteamos referral_reward_count para mantener el historial, pero limpiamos premios
    db.commit()
    return {"message": "Premios de referido reseteados correctamente"}
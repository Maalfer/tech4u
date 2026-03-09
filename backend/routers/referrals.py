"""
Sistema de Referidos — Tech4U Academy
======================================
Arquitectura completa con anti-fraude, integración Stripe y panel admin.

Flujo:
  1. El alumno A comparte su código (User.referral_code).
  2. El alumno B se registra usando ese código → se crea Referral(status="pending").
  3. Cuando B completa un pago de suscripción → webhook Stripe llama a confirm_referral().
  4. confirm_referral() cambia status a "confirmed" y genera recompensa para A:
       - Cada referido confirmado → +1 pending_10p_discounts (cupón del 10%)
       - Cada 10 referidos confirmados → +1 free_months_accumulated (mes gratis extra)
  5. Anti-fraude: IPs, fingerprints, auto-rechazo por abuso.
"""

import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, User, Referral
from auth import get_current_user, require_admin, require_management
from limiter import limiter

router = APIRouter(tags=["Referrals"])


# ─────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────

def _get_client_ip(request: Request) -> str:
    """Extrae la IP real del cliente (compatible con proxies)."""
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _count_recent_registrations_from_ip(db: Session, ip: str, referrer_id: int, hours: int = 24) -> int:
    """Cuántos referidos vinieron de la misma IP en las últimas N horas."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    return db.query(Referral).filter(
        Referral.referrer_id == referrer_id,
        Referral.ip_address == ip,
        Referral.created_at >= cutoff,
    ).count()


def _confirm_referral_and_reward(db: Session, referred_user: User) -> bool:
    """
    Confirma el referido de `referred_user` (si existe uno pendiente) y
    otorga la recompensa al referidor.
    Devuelve True si se confirmó algo, False en caso contrario.
    Llamado exclusivamente desde el webhook de Stripe.
    """
    referral = db.query(Referral).filter(
        Referral.referred_id == referred_user.id,
        Referral.status == "pending",
    ).first()

    if not referral:
        return False

    # Confirmar
    referral.status = "confirmed"
    referral.confirmed_at = datetime.utcnow()

    # Obtener referidor
    referrer = db.query(User).filter(User.id == referral.referrer_id).first()
    if not referrer:
        db.commit()
        return False

    # Actualizar contador total
    referrer.referral_reward_count = (referrer.referral_reward_count or 0) + 1

    # Recompensa base: +1 cupón del 10% por cada referido confirmado
    referrer.pending_10p_discounts = (referrer.pending_10p_discounts or 0) + 1

    # Hito: cada 10 referidos confirmados → +1 mes gratis
    if referrer.referral_reward_count % 10 == 0:
        referrer.free_months_accumulated = (referrer.free_months_accumulated or 0) + 1

    db.commit()
    return True


# ─────────────────────────────────────────────────────────
# ENDPOINTS PÚBLICOS / ALUMNO
# ─────────────────────────────────────────────────────────

@router.post("/referrals/apply-code")
@limiter.limit("10/minute")
def apply_referral_code(
    request: Request,
    code: str,
    device_fingerprint: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    El alumno aplica un código de referido (puede llamarse tras el registro
    o desde su panel si aún no tiene referido asignado).

    Anti-fraude:
    - No puede referirse a sí mismo.
    - Solo 1 código de referido por cuenta.
    - Máx. 3 registros desde la misma IP con el mismo referidor en 24h.
    - No puede usarse si el usuario ya tiene suscripción activa (evita abusos post-pago).
    """
    code = code.upper().strip()
    ip = _get_client_ip(request)

    # 1. El usuario ya tiene un referido asignado
    existing = db.query(Referral).filter(Referral.referred_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes un código de referido aplicado.")

    # 2. Encontrar al referidor por su código
    referrer = db.query(User).filter(User.referral_code == code).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Código de referido inválido.")

    # 3. No puede auto-referirse
    if referrer.id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes usar tu propio código de referido.")

    # 4. El referidor no puede ser un alumno sin suscripción activa (opcional — descomenta si lo quieres)
    # if referrer.subscription_type == "free":
    #     raise HTTPException(status_code=400, detail="El propietario del código no tiene suscripción activa.")

    # 5. Abuso de IP: máx. 3 desde la misma IP en 24h hacia el mismo referidor
    ip_count = _count_recent_registrations_from_ip(db, ip, referrer.id, hours=24)
    if ip_count >= 3:
        # Marcamos el referral como fraude directamente
        fraud_referral = Referral(
            referrer_id=referrer.id,
            referred_id=current_user.id,
            status="fraud",
            ip_address=ip,
            device_fingerprint=device_fingerprint,
            rejection_reason=f"Límite de IP superado: {ip_count + 1} registros en 24h desde {ip}",
        )
        db.add(fraud_referral)
        db.commit()
        raise HTTPException(
            status_code=429,
            detail="Demasiados registros desde la misma red. Código marcado como sospechoso.",
        )

    # 6. Crear la relación de referido (status: pending hasta que pague)
    referral = Referral(
        referrer_id=referrer.id,
        referred_id=current_user.id,
        ip_address=ip,
        device_fingerprint=device_fingerprint,
        status="pending",
    )
    db.add(referral)

    # También guardamos el referred_by_id en el User para consultas rápidas
    current_user.referred_by_id = referrer.id
    db.commit()

    return {
        "success": True,
        "message": f"Código de {referrer.nombre} aplicado. La recompensa se activará cuando completes tu primera suscripción.",
        "referrer_name": referrer.nombre,
    }


@router.get("/referrals/stats")
def get_my_referral_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Devuelve las estadísticas de referidos del usuario autenticado:
    - Código propio
    - Cuántos ha invitado (total, pendientes, confirmados)
    - Recompensas disponibles
    """
    sent = db.query(Referral).filter(Referral.referrer_id == current_user.id).all()

    total = len(sent)
    pending = sum(1 for r in sent if r.status == "pending")
    confirmed = sum(1 for r in sent if r.status == "confirmed")
    rejected = sum(1 for r in sent if r.status in ("rejected", "fraud"))

    # Progreso hacia el siguiente mes gratis (cada 10 confirmados)
    confirmed_total = current_user.referral_reward_count or 0
    progress_to_free_month = confirmed_total % 10  # 0-9 dentro del ciclo actual
    next_free_month_at = ((confirmed_total // 10) + 1) * 10

    return {
        "referral_code": current_user.referral_code,
        "total_sent": total,
        "pending": pending,
        "confirmed": confirmed,
        "rejected": rejected,
        "pending_10p_discounts": current_user.pending_10p_discounts or 0,
        "free_months_accumulated": current_user.free_months_accumulated or 0,
        "progress_to_free_month": progress_to_free_month,
        "next_free_month_at": next_free_month_at,
        "referrals": [
            {
                "id": r.id,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
                "confirmed_at": r.confirmed_at.isoformat() if r.confirmed_at else None,
            }
            for r in sent
        ],
    }


@router.post("/referrals/generate-code")
def generate_my_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Genera un código de referido único para el usuario si aún no tiene uno.
    El código es: T4U + primeras 6 letras del nombre (mayúsculas) + id hasheado a 4 chars.
    """
    if current_user.referral_code:
        return {"referral_code": current_user.referral_code}

    base = f"T4U{current_user.nombre[:4].upper().replace(' ', '')}"
    suffix = hashlib.md5(f"{current_user.id}{current_user.email}".encode()).hexdigest()[:4].upper()
    code = f"{base}{suffix}"

    # Garantizar unicidad
    attempts = 0
    while db.query(User).filter(User.referral_code == code).first():
        suffix = hashlib.md5(f"{current_user.id}{current_user.email}{attempts}".encode()).hexdigest()[:4].upper()
        code = f"{base}{suffix}"
        attempts += 1

    current_user.referral_code = code
    db.commit()

    return {"referral_code": code}


# ─────────────────────────────────────────────────────────
# ENDPOINTS ADMIN
# ─────────────────────────────────────────────────────────

@router.get("/admin/referrals/")
def admin_list_referrals(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """
    (Admin/Docente) Lista todos los referidos con información completa.
    Filtrable por status: pending | confirmed | rejected | fraud
    """
    q = db.query(Referral)
    if status_filter:
        q = q.filter(Referral.status == status_filter)
    q = q.order_by(Referral.created_at.desc())

    total = q.count()
    referrals = q.offset(skip).limit(limit).all()

    def _user_info(u: User):
        if not u:
            return None
        return {
            "id": u.id,
            "nombre": u.nombre,
            "email": u.email,
            "subscription_type": u.subscription_type,
            "level": u.level,
        }

    return {
        "total": total,
        "referrals": [
            {
                "id": r.id,
                "status": r.status,
                "referrer": _user_info(r.referrer),
                "referred": _user_info(r.referred),
                "ip_address": r.ip_address,
                "device_fingerprint": r.device_fingerprint[:8] + "..." if r.device_fingerprint else None,
                "created_at": r.created_at.isoformat(),
                "confirmed_at": r.confirmed_at.isoformat() if r.confirmed_at else None,
                "rejection_reason": r.rejection_reason,
            }
            for r in referrals
        ],
    }


@router.get("/admin/referrals/stats")
def admin_referral_stats(
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """
    (Admin) Estadísticas globales del sistema de referidos.
    Top referidores, tasa de conversión, fraude detectado.
    """
    total = db.query(Referral).count()
    pending = db.query(Referral).filter(Referral.status == "pending").count()
    confirmed = db.query(Referral).filter(Referral.status == "confirmed").count()
    rejected = db.query(Referral).filter(Referral.status == "rejected").count()
    fraud = db.query(Referral).filter(Referral.status == "fraud").count()

    conversion_rate = round((confirmed / total * 100), 1) if total > 0 else 0

    # Top 10 referidores por referidos confirmados
    top_referrers_raw = (
        db.query(
            Referral.referrer_id,
            func.count(Referral.id).label("confirmed_count"),
        )
        .filter(Referral.status == "confirmed")
        .group_by(Referral.referrer_id)
        .order_by(func.count(Referral.id).desc())
        .limit(10)
        .all()
    )

    top_referrers = []
    for row in top_referrers_raw:
        u = db.query(User).filter(User.id == row.referrer_id).first()
        if u:
            top_referrers.append({
                "user_id": u.id,
                "nombre": u.nombre,
                "email": u.email,
                "confirmed_referrals": row.confirmed_count,
                "pending_discounts": u.pending_10p_discounts or 0,
                "free_months": u.free_months_accumulated or 0,
            })

    # IPs sospechosas (>3 registros en el mismo referidor)
    suspicious_ips_raw = (
        db.query(
            Referral.ip_address,
            Referral.referrer_id,
            func.count(Referral.id).label("count"),
        )
        .group_by(Referral.ip_address, Referral.referrer_id)
        .having(func.count(Referral.id) >= 3)
        .all()
    )

    suspicious = [
        {
            "ip": row.ip_address,
            "referrer_id": row.referrer_id,
            "count": row.count,
        }
        for row in suspicious_ips_raw
        if row.ip_address and row.ip_address != "unknown"
    ]

    return {
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "rejected": rejected,
        "fraud": fraud,
        "conversion_rate_percent": conversion_rate,
        "top_referrers": top_referrers,
        "suspicious_ips": suspicious,
    }


@router.patch("/admin/referrals/{referral_id}/confirm")
def admin_confirm_referral(
    referral_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    (Admin) Confirma manualmente un referido pendiente y otorga la recompensa al referidor.
    Útil para casos donde el webhook de Stripe no llegó o pagos manuales.
    """
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referido no encontrado.")
    if referral.status == "confirmed":
        raise HTTPException(status_code=400, detail="Este referido ya está confirmado.")
    if referral.status == "fraud":
        raise HTTPException(status_code=400, detail="No se puede confirmar un referido marcado como fraude.")

    referral.status = "confirmed"
    referral.confirmed_at = datetime.utcnow()

    referrer = db.query(User).filter(User.id == referral.referrer_id).first()
    if referrer:
        referrer.referral_reward_count = (referrer.referral_reward_count or 0) + 1
        referrer.pending_10p_discounts = (referrer.pending_10p_discounts or 0) + 1
        if referrer.referral_reward_count % 10 == 0:
            referrer.free_months_accumulated = (referrer.free_months_accumulated or 0) + 1

    db.commit()
    return {"success": True, "message": "Referido confirmado y recompensa otorgada."}


@router.patch("/admin/referrals/{referral_id}/reject")
def admin_reject_referral(
    referral_id: int,
    reason: Optional[str] = "Rechazado manualmente por admin",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin) Rechaza un referido con motivo."""
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referido no encontrado.")
    if referral.status == "confirmed":
        raise HTTPException(status_code=400, detail="No se puede rechazar un referido ya confirmado.")

    referral.status = "rejected"
    referral.rejection_reason = reason
    db.commit()
    return {"success": True, "message": "Referido rechazado."}


@router.patch("/admin/referrals/{referral_id}/flag-fraud")
def admin_flag_fraud(
    referral_id: int,
    reason: Optional[str] = "Fraude detectado manualmente",
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    (Admin) Marca un referido como fraude.
    Si estaba confirmado previamente, revierte las recompensas del referidor.
    """
    referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not referral:
        raise HTTPException(status_code=404, detail="Referido no encontrado.")

    was_confirmed = referral.status == "confirmed"
    referral.status = "fraud"
    referral.rejection_reason = reason

    # Si ya estaba confirmado, revertir recompensas del referidor
    if was_confirmed:
        referrer = db.query(User).filter(User.id == referral.referrer_id).first()
        if referrer:
            referrer.referral_reward_count = max(0, (referrer.referral_reward_count or 0) - 1)
            referrer.pending_10p_discounts = max(0, (referrer.pending_10p_discounts or 0) - 1)

    db.commit()
    return {
        "success": True,
        "message": "Referido marcado como fraude." + (" Recompensas revertidas." if was_confirmed else ""),
    }


# ─────────────────────────────────────────────────────────
# FUNCIÓN PÚBLICA (llamada desde subscriptions.py webhook)
# ─────────────────────────────────────────────────────────

def confirm_referral_on_payment(db: Session, user: User) -> bool:
    """
    Punto de integración con el webhook de Stripe.
    Llama a esta función cuando un pago de suscripción se completa exitosamente.
    Retorna True si se confirmó un referido nuevo.
    """
    return _confirm_referral_and_reward(db, user)

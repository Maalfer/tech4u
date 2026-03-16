import stripe
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from database import get_db, User, Coupon, UserCoursePurchase
from auth import get_current_user
from dotenv import load_dotenv
import logging
from limiter import limiter

logger = logging.getLogger(__name__)

# Importación circular segura (solo se usa dentro del webhook)
from routers.referrals import confirm_referral_on_payment

load_dotenv()

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

if not WEBHOOK_SECRET:
    import warnings
    warnings.warn("STRIPE_WEBHOOK_SECRET no configurado — webhooks de Stripe no funcionarán correctamente", RuntimeWarning)

# Precios en céntimos (Stripe trabaja en la unidad más pequeña)
PLANS = {
    "monthly": {
        "name": "Plan Mensual — Tech4U",
        "amount": 999,        # 9,99 €
        "currency": "eur",
        "interval": "month",
        "subscription_type": "monthly",
        "days": 30,
    },
    "quarterly": {
        "name": "Plan Trimestral — Tech4U",
        "amount": 2499,       # 24,99 €
        "currency": "eur",
        "interval": "month",
        "subscription_type": "quarterly",
        "days": 90,
    },
    "annual": {
        "name": "Plan Anual — Tech4U",
        "amount": 7999,       # 79,99 €
        "currency": "eur",
        "interval": "year",
        "subscription_type": "annual",
        "days": 365,
    },
}

PLAN_LABELS = {
    "free": "Gratuito",
    "monthly": "Mensual",
    "quarterly": "Trimestral",
    "annual": "Anual",
}

# Docente / Centro license packs (amounts in cents — Stripe style)
DOCENTE_PLANS = {
    # ── Mensual ───────────────────────────────────────────────────────────────
    "starter":        {"licenses": 15,  "amount": 2499,  "label": "Starter · 15 alumnos",        "days": 30},
    "clase":          {"licenses": 30,  "amount": 3999,  "label": "Clase · 30 alumnos",          "days": 30},
    "centro":         {"licenses": 60,  "amount": 5999,  "label": "Centro · 60 alumnos",         "days": 30},
    "campus":         {"licenses": 100, "amount": 8999,  "label": "Campus · 100 alumnos",        "days": 30},
    # ── Anual (10 meses, 2 gratis) ────────────────────────────────────────────
    "starter_annual": {"licenses": 15,  "amount": 24990, "label": "Starter Anual · 15 alumnos",  "days": 365},
    "clase_annual":   {"licenses": 30,  "amount": 39990, "label": "Clase Anual · 30 alumnos",    "days": 365},
    "centro_annual":  {"licenses": 60,  "amount": 59990, "label": "Centro Anual · 60 alumnos",   "days": 365},
    "campus_annual":  {"licenses": 100, "amount": 89990, "label": "Campus Anual · 100 alumnos",  "days": 365},
}


@router.get("/my")
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve los detalles completos de la suscripción del usuario autenticado."""
    is_active = (
        current_user.subscription_type != "free"
        and current_user.subscription_end is not None
        and current_user.subscription_end > datetime.utcnow()
    )
    return {
        "subscription_type": current_user.subscription_type,
        "plan_label": PLAN_LABELS.get(current_user.subscription_type, "Desconocido"),
        "is_active": is_active,
        "subscription_start": current_user.subscription_start.isoformat() if current_user.subscription_start else None,
        "subscription_end": current_user.subscription_end.isoformat() if current_user.subscription_end else None,
        "auto_renew": current_user.auto_renew if current_user.auto_renew is not None else True,
        "months_subscribed": current_user.months_subscribed or 0,
    }


@router.post("/toggle-auto-renew")
def toggle_auto_renew(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Activa o desactiva la renovación automática de la suscripción."""
    current_user.auto_renew = not (current_user.auto_renew if current_user.auto_renew is not None else True)
    db.commit()
    return {"auto_renew": current_user.auto_renew}


@router.get("/validate-coupon")
def validate_coupon(code: str, plan: str = "monthly", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Valida un cupón y devuelve el porcentaje si es válido."""
    c = db.query(Coupon).filter(Coupon.code == code.upper(), Coupon.is_active == True).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón inválido o inactivo.")

    if c.current_uses >= c.max_uses:
        c.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="El cupón ha superado el límite de usos.")

    # TODO: Add per-user coupon usage tracking table to prevent same user using coupon twice

    # Verificar expiración
    if c.expires_at and c.expires_at < datetime.utcnow():
        c.is_active = False
        db.commit()
        raise HTTPException(status_code=400, detail="Este cupón ha expirado.")

    # Restricción de usuario único
    if c.assigned_to_id and c.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Este cupón no te pertenece.")

    # Restricción de plan aplicable
    applicable = getattr(c, 'applicable_plans', 'all') or 'all'
    if applicable != 'all' and applicable != plan:
        raise HTTPException(
            status_code=400,
            detail=f"Este cupón solo es válido para el plan {applicable}."
        )

    # Restricción legacy: >15% solo mensual y trimestral
    if c.discount_percent > 15 and plan == "annual":
        raise HTTPException(status_code=400, detail="Cupones superiores al 15% solo válidos para planes mensuales y trimestrales.")

    return {"valid": True, "discount_percent": c.discount_percent}

@router.post("/create-checkout-session")
@limiter.limit("10/minute")
def create_checkout_session(
    request: Request,
    plan: str,
    coupon_code: Optional[str] = None,
    use_referral_discount: bool = False,
    use_free_month: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Crea una sesión de Stripe Checkout para el plan indicado.
    Si se aplica un cupón del 100%, se salta Stripe y se otorga al instante.
    """
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Plan no válido. Usa 'monthly' o 'annual'.")

    selected = PLANS[plan]
    final_amount = selected["amount"]
    applied_coupon = None
    reward_used_type = None

    # 1. Prioridad: Mes Gratis (si el usuario lo activa y tiene acumulados)
    if use_free_month:
        if plan != "monthly":
            raise HTTPException(status_code=400, detail="Los meses gratis de regalo solo se pueden aplicar al plan mensual.")
        
        if (current_user.free_months_accumulated or 0) > 0:
            current_user.free_months_accumulated -= 1
            current_user.subscription_type = selected["subscription_type"]
            current_user.subscription_start = datetime.utcnow()
            current_user.subscription_end = datetime.utcnow() + timedelta(days=selected["days"])
            current_user.months_subscribed = (current_user.months_subscribed or 0) + 1
            db.commit()
            url_success = f"{FRONTEND_URL}/suscripcion/exito?session_id=free_reward_applied"
            return {"url": url_success}
        else:
            raise HTTPException(status_code=400, detail="No tienes meses gratis acumulados.")

    # 2. Descuento del 10% por Referido (No acumulable con cupones manuales)
    if use_referral_discount:
        if (current_user.pending_10p_discounts or 0) > 0:
            if coupon_code:
                raise HTTPException(status_code=400, detail="El descuento de referido no es acumulable con otros cupones.")
            
            discount = int(0.10 * final_amount)
            final_amount = max(0, final_amount - discount)
            reward_used_type = "referral_10p"
        else:
            raise HTTPException(status_code=400, detail="No tienes descuentos de referido pendientes.")

    # 3. Cupón Estándar (si no se usó descuento de referido)
    if coupon_code and not reward_used_type:
        c = db.query(Coupon).filter(Coupon.code == coupon_code.upper(), Coupon.is_active == True).first()
        if not c or c.current_uses >= c.max_uses:
            raise HTTPException(status_code=400, detail="Cupón inválido o agotado.")
        
        # Restricción de usuario único
        if c.assigned_to_id and c.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Este cupón no te pertenece.")

        # Restricción de plan: >15% solo mensual y trimestral
        if c.discount_percent > 15 and plan == "annual":
            raise HTTPException(status_code=400, detail="Cupones superiores al 15% solo válidos para planes mensuales y trimestrales.")
        
        applied_coupon = c
        discount = int((c.discount_percent / 100.0) * final_amount)
        final_amount = max(0, final_amount - discount)

    # 🚀 EXCEPCIÓN: Si el descuento es del 100% via CUPÓN
    if final_amount == 0 and applied_coupon:
        current_user.subscription_type = selected["subscription_type"]
        current_user.subscription_start = datetime.utcnow()
        current_user.subscription_end = datetime.utcnow() + timedelta(days=selected["days"])
        current_user.months_subscribed = (current_user.months_subscribed or 0) + 1
        applied_coupon.current_uses += 1
        if applied_coupon.current_uses >= applied_coupon.max_uses:
            applied_coupon.is_active = False
        db.commit()
        url_success = f"{FRONTEND_URL}/suscripcion/exito?session_id=free_bypass_{applied_coupon.code}"
        return {"url": url_success}

    if not stripe.api_key:
        raise HTTPException(
            status_code=503,
            detail="Stripe no está configurado. Añade STRIPE_SECRET_KEY al .env.",
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": selected["currency"],
                        "unit_amount": final_amount,
                        "product_data": {"name": f"{selected['name']} {f'(Descuento {applied_coupon.discount_percent}%)' if applied_coupon else ''}"},
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            client_reference_id=str(current_user.id),
            metadata={
                "plan": plan, 
                "user_id": str(current_user.id),
                "coupon_code": applied_coupon.code if applied_coupon else "",
                "reward_used": reward_used_type if reward_used_type else ""
            },
            success_url=f"{FRONTEND_URL}/suscripcion/exito?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/suscripcion?cancelled=true",
            customer_email=current_user.email,
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Error de Stripe: {str(e)}")


@router.post("/docente/create-checkout-session")
def create_docente_checkout_session(
    plan_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Crea una sesión de Stripe Checkout para comprar un pack de licencias de docente.
    Al completarse el pago, el webhook activa automáticamente el rol docente.
    """
    if plan_key not in DOCENTE_PLANS:
        raise HTTPException(
            status_code=400,
            detail=f"Plan no válido. Opciones: {', '.join(DOCENTE_PLANS.keys())}",
        )

    if not stripe.api_key:
        raise HTTPException(
            status_code=503,
            detail="Stripe no está configurado. Añade STRIPE_SECRET_KEY al .env.",
        )

    plan = DOCENTE_PLANS[plan_key]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "unit_amount": plan["amount"],
                    "product_data": {
                        "name": f"Tech4U — {plan['label']} (mensual)",
                        "description": f"{plan['licenses']} licencias de alumno · 30 días",
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            client_reference_id=str(current_user.id),
            metadata={
                "type":          "docente_license",
                "plan_key":      plan_key,
                "license_count": str(plan["licenses"]),
                "user_id":       str(current_user.id),
            },
            customer_email=current_user.email,
            success_url=f"{FRONTEND_URL}/docente-planes/exito?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/docente-planes?cancelled=true",
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Error de Stripe: {str(e)}")


@router.get("/docente/verify-session")
def verify_docente_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fallback: verifica la sesión de Stripe y activa el plan docente si el webhook
    no llegó a tiempo (llamado desde la página de éxito tras el pago).
    """
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe no configurado.")

    try:
        session_obj = stripe.checkout.Session.retrieve(session_id)
    except stripe.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Error de Stripe: {str(e)}")

    if session_obj.payment_status != "paid":
        return {"success": False}

    metadata = session_obj.get("metadata", {})
    if metadata.get("type") != "docente_license":
        return {"success": False, "detail": "Sesión no corresponde a un plan docente."}

    plan_key = metadata.get("plan_key")
    if plan_key not in DOCENTE_PLANS:
        return {"success": False, "detail": "Plan key no reconocido."}

    plan = DOCENTE_PLANS[plan_key]
    now  = datetime.utcnow()

    # Only activate if not already set by the webhook (idempotent)
    if current_user.docente_plan_key != plan_key or not current_user.docente_plan_expires or current_user.docente_plan_expires < now:
        current_expiry = current_user.docente_plan_expires
        new_expiry = (current_expiry + timedelta(days=plan["days"])
                      if current_expiry and current_expiry > now
                      else now + timedelta(days=plan["days"]))

        current_user.role                  = "docente"
        current_user.docente_plan_key      = plan_key
        current_user.docente_plan_expires  = new_expiry
        current_user.docente_license_total = max(
            current_user.docente_license_total or 0,
            plan["licenses"],
        )
        db.commit()
        db.refresh(current_user)

    return {
        "success":       True,
        "plan_key":      current_user.docente_plan_key,
        "license_count": current_user.docente_license_total,
        "expires":       current_user.docente_plan_expires.isoformat() if current_user.docente_plan_expires else None,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint que Stripe llama cuando un pago se completa.
    Actualiza subscription_type y subscription_end del usuario en la BD.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret no configurado")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except ValueError:
        raise HTTPException(status_code=400, detail="Payload inválido")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Firma de webhook inválida")

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj.get("client_reference_id")
        metadata = session_obj.get("metadata", {})
        
        # ── DETERMINAR TIPO DE COMPRA ──
        purchase_type = metadata.get("type", "subscription") # Default to sub if not set
        
        if not user_id:
            return {"status": "no_user_id"}

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return {"status": "user_not_found"}

        if purchase_type == "docente_license":
            # ── Compra de pack de licencias para docente/centro ──────────────
            plan_key = metadata.get("plan_key")
            if plan_key and plan_key in DOCENTE_PLANS:
                plan = DOCENTE_PLANS[plan_key]
                now  = datetime.utcnow()

                current_expiry = user.docente_plan_expires
                new_expiry = (current_expiry + timedelta(days=plan["days"])
                              if current_expiry and current_expiry > now
                              else now + timedelta(days=plan["days"]))

                user.role                  = "docente"
                user.docente_plan_key      = plan_key
                user.docente_plan_expires  = new_expiry
                user.docente_license_total = max(user.docente_license_total or 0, plan["licenses"])
                db.commit()
                logger.info(f"Webhook: docente plan '{plan_key}' activated for user_id={user.id}")
            else:
                logger.warning(f"Webhook: docente_license event with unknown plan_key='{plan_key}'")

        elif purchase_type == "course_purchase":
            # Caso Academy Shop: Compra vitalicia de curso
            course_id = metadata.get("course_id")
            if course_id:
                # Evitar duplicados (idempotencia)
                exists = db.query(UserCoursePurchase).filter(
                    UserCoursePurchase.user_id == user.id,
                    UserCoursePurchase.course_id == int(course_id)
                ).first()
                if not exists:
                    new_purchase = UserCoursePurchase(user_id=user.id, course_id=int(course_id))
                    db.add(new_purchase)
                    db.commit()
        else:
            # Caso Suscripción
            plan = metadata.get("plan", "monthly")
            coupon_code = metadata.get("coupon_code", "")
            
            plan_info = PLANS.get(plan, PLANS["monthly"])
            user.subscription_type = plan_info["subscription_type"]
            user.subscription_start = datetime.utcnow()
            user.subscription_end = datetime.utcnow() + timedelta(days=plan_info["days"])
            user.months_subscribed = (user.months_subscribed or 0) + (
                1 if plan == "monthly" else (3 if plan == "quarterly" else 12)
            )
            
            if coupon_code:
                coupon = db.query(Coupon).filter(Coupon.code == coupon_code).first()
                if coupon:
                    coupon.current_uses += 1
                    if coupon.current_uses >= coupon.max_uses:
                        coupon.is_active = False

            reward_used = metadata.get("reward_used")
            if reward_used == "referral_10p":
                user.pending_10p_discounts = max(0, (user.pending_10p_discounts or 0) - 1)

            # Bonus shields on subscription activation
            bonus_shields = 2 if plan == "quarterly" else (4 if plan == "annual" else 0)
            if bonus_shields > 0:
                user.streak_protections = (user.streak_protections or 0) + bonus_shields

            db.commit()

            # ── CONFIRMAR REFERIDO (si el usuario tiene uno pendiente) ──
            # Esto otorga automáticamente la recompensa al referidor.
            confirm_referral_on_payment(db, user)

    return {"status": "ok"}


@router.get("/verify-session")
def verify_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Verifica el estado de una sesión de pago (llamado desde la página de éxito).
    Si el pago fue exitoso, actualiza la suscripción del usuario (fallback si el webhook tarda).
    """
    # 🚀 Verificamos el bypass
    if session_id.startswith("free_bypass"):
        # La asignación real ya se hizo en /create-checkout-session, por lo que solo le damos success
        return {
            "success": True,
            "subscription_type": current_user.subscription_type,
            "subscription_end": current_user.subscription_end.isoformat() if current_user.subscription_end else None,
            "plan": "100% Free Bypass",
        }

    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe no configurado.")

    try:
        session_obj = stripe.checkout.Session.retrieve(session_id)
    except stripe.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Error de Stripe: {str(e)}")

    if session_obj.payment_status == "paid":
        plan = session_obj.metadata.get("plan", "monthly")
        plan_info = PLANS.get(plan, PLANS["monthly"])

        # Actualizar si aún está en free (por si el webhook no llegó aún)
        if current_user.subscription_type == "free":
            current_user.subscription_type = plan_info["subscription_type"]
            current_user.subscription_start = datetime.utcnow()
            current_user.subscription_end = datetime.utcnow() + timedelta(days=plan_info["days"])
            current_user.months_subscribed = (current_user.months_subscribed or 0) + (
                1 if plan == "monthly" else (3 if plan == "quarterly" else 12)
            )
            
            # 🔥 PROCESAR CUPÓN (Fallback)
            coupon_code = session_obj.metadata.get("coupon_code", "")
            if coupon_code:
                coupon = db.query(Coupon).filter(Coupon.code == coupon_code).first()
                # Evitar doble conteo si el webhook ya pasó pero el tipo sigue siendo free (raro pero posible)
                if coupon:
                    coupon.current_uses += 1
                    if coupon.current_uses >= coupon.max_uses:
                        coupon.is_active = False
            
            # PROCESAR RECOMPENSA REFERIDO (Fallback)
            reward_used = session_obj.metadata.get("reward_used")
            if reward_used == "referral_10p":
                current_user.pending_10p_discounts = max(0, (current_user.pending_10p_discounts or 0) - 1)

            # Bonus shields on subscription activation (Fallback)
            bonus_shields = 2 if plan == "quarterly" else (4 if plan == "annual" else 0)
            if bonus_shields > 0:
                current_user.streak_protections = (current_user.streak_protections or 0) + bonus_shields

            db.commit()
            db.refresh(current_user)

        return {
            "success": True,
            "subscription_type": current_user.subscription_type,
            "subscription_end": current_user.subscription_end.isoformat() if current_user.subscription_end else None,
            "plan": plan,
        }

    return {"success": False}
@router.post("/cancel")
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cancela la renovación automática de la suscripción. 
    El usuario mantiene el acceso hasta la fecha de finalización actual.
    """
    if current_user.subscription_type == "free":
        raise HTTPException(status_code=400, detail="No tienes una suscripción activa para cancelar.")
    
    current_user.auto_renew = False
    db.commit()
    return {"message": "Suscripción cancelada. Mantendrás el acceso hasta el fin del periodo actual.", "subscription_end": current_user.subscription_end}

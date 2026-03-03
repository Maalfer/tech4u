import stripe
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User
from auth import get_current_user
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

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
    "annual": {
        "name": "Plan Anual — Tech4U",
        "amount": 7999,       # 79,99 €
        "currency": "eur",
        "interval": "year",
        "subscription_type": "annual",
        "days": 365,
    },
}


@router.post("/create-checkout-session")
def create_checkout_session(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Crea una sesión de Stripe Checkout para el plan indicado (monthly | annual).
    Devuelve la URL a la que el frontend debe redirigir al usuario.
    """
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Plan no válido. Usa 'monthly' o 'annual'.")

    if not stripe.api_key:
        raise HTTPException(
            status_code=503,
            detail="Stripe no está configurado. Añade STRIPE_SECRET_KEY al .env.",
        )

    selected = PLANS[plan]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": selected["currency"],
                        "unit_amount": selected["amount"],
                        "product_data": {"name": selected["name"]},
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            client_reference_id=str(current_user.id),
            metadata={"plan": plan, "user_id": str(current_user.id)},
            success_url=f"http://localhost:5174/suscripcion/exito?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"http://localhost:5174/suscripcion?cancelled=true",
            customer_email=current_user.email,
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Error de Stripe: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint que Stripe llama cuando un pago se completa.
    Actualiza subscription_type y subscription_end del usuario en la BD.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        if WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
        else:
            # Sin webhook secret: confiar en el payload (solo para desarrollo)
            import json
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except ValueError:
        raise HTTPException(status_code=400, detail="Payload inválido")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Firma de webhook inválida")

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj.get("client_reference_id")
        plan = session_obj.get("metadata", {}).get("plan", "monthly")

        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                plan_info = PLANS.get(plan, PLANS["monthly"])
                user.subscription_type = plan_info["subscription_type"]
                user.subscription_end = datetime.utcnow() + timedelta(days=plan_info["days"])
                user.months_subscribed = (user.months_subscribed or 0) + (
                    1 if plan == "monthly" else 12
                )
                db.commit()

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
            current_user.subscription_end = datetime.utcnow() + timedelta(days=plan_info["days"])
            current_user.months_subscribed = (current_user.months_subscribed or 0) + (
                1 if plan == "monthly" else 12
            )
            db.commit()
            db.refresh(current_user)

        return {
            "success": True,
            "subscription_type": current_user.subscription_type,
            "subscription_end": current_user.subscription_end.isoformat() if current_user.subscription_end else None,
            "plan": plan,
        }

    return {"success": False}

import os
import requests
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db, User, PayPalOrder, Coupon
from auth import get_current_user
from schemas import PayPalOrderCreate, PayPalOrderOut
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/paypal", tags=["PayPal"])

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox") # sandbox or live

PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"

PLANS = {
    "monthly": {"days": 30, "amount": "9.99", "label": "monthly"},
    "quarterly": {"days": 90, "amount": "24.99", "label": "quarterly"},
    "annual": {"days": 365, "amount": "79.99", "label": "annual"},
}

def get_paypal_access_token():
    """Obtiene el access token de PayPal usando Client ID y Secret."""
    url = f"{PAYPAL_API_BASE}/v1/oauth2/token"
    headers = {"Accept": "application/json", "Accept-Language": "en_US"}
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(
        url, 
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET), 
        headers=headers, 
        data=data
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Error al autenticar con PayPal")
    
    return response.json()["access_token"]

@router.post("/create-order", response_model=dict)
def create_paypal_order(
    payload: PayPalOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crea una orden en PayPal y la registra en la base de datos local."""
    if payload.subscription_type not in PLANS:
        raise HTTPException(status_code=400, detail="Plan no válido")
    
    token = get_paypal_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "EUR",
                "value": str(payload.amount)
            },
            "description": f"Suscripción {payload.subscription_type} - Tech4U"
        }],
        "application_context": {
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW"
        }
    }
    
    response = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders",
        headers=headers,
        data=json.dumps(order_data)
    )
    
    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=502, detail=f"Error de PayPal al crear orden: {response.text}")
    
    paypal_data = response.json()
    
    # Registrar en nuestra BD
    new_order = PayPalOrder(
        user_id=current_user.id,
        paypal_order_id=paypal_data["id"],
        status="CREATED",
        amount=payload.amount,
        subscription_type=payload.subscription_type
    )
    db.add(new_order)
    db.commit()
    
    return {"id": paypal_data["id"]}

@router.post("/capture-order/{order_id}")
def capture_paypal_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Captura el pago de una orden de PayPal y activa la suscripción."""
    # 1. Verificar si la orden existe en nuestra BD
    order_rec = db.query(PayPalOrder).filter(
        PayPalOrder.paypal_order_id == order_id,
        PayPalOrder.user_id == current_user.id
    ).first()
    
    if not order_rec:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    if order_rec.status == "CAPTURED":
        return {"status": "already_captured"}

    # 2. Capturar en PayPal
    token = get_paypal_access_token()
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
        headers=headers
    )
    
    if response.status_code not in [200, 201]:
        order_rec.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=502, detail=f"Error al capturar pago en PayPal: {response.text}")
    
    capture_data = response.json()
    if capture_data.get("status") == "COMPLETED":
        # 3. Éxito: Actualizar suscripción
        order_rec.status = "CAPTURED"
        
        plan_info = PLANS.get(order_rec.subscription_type, PLANS["monthly"])
        
        # Lógica de actualización de suscripción (similar a Stripe)
        current_user.subscription_type = order_rec.subscription_type
        current_user.subscription_start = datetime.utcnow()
        current_user.subscription_end = datetime.utcnow() + timedelta(days=plan_info["days"])
        current_user.months_subscribed = (current_user.months_subscribed or 0) + (
            1 if order_rec.subscription_type == "monthly" else (3 if order_rec.subscription_type == "quarterly" else 12)
        )

        # Bonus shields on subscription activation
        plan = order_rec.subscription_type
        bonus_shields = 2 if plan == "quarterly" else (4 if plan == "annual" else 0)
        if bonus_shields > 0:
            current_user.streak_protections = (current_user.streak_protections or 0) + bonus_shields

        db.commit()
        return {"status": "COMPLETED", "subscription_type": current_user.subscription_type}
    else:
        return {"status": capture_data.get("status", "UNKNOWN")}

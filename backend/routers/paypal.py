import os
import requests
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db, User, PayPalOrder
from auth import get_current_user
from schemas import PayPalOrderCreate
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/paypal", tags=["PayPal"])

PAYPAL_CLIENT_ID     = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE          = os.getenv("PAYPAL_MODE", "sandbox")  # "sandbox" | "live"
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:5173")

PAYPAL_API_BASE = (
    "https://api-m.sandbox.paypal.com"
    if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)

# Canonical plan prices — NEVER use client-supplied amounts
PLANS = {
    "monthly":   {"days": 30,  "amount": "9.99",  "label": "Mensual"},
    "quarterly": {"days": 90,  "amount": "24.99", "label": "Trimestral"},
    "annual":    {"days": 365, "amount": "79.99", "label": "Anual"},
}



# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────

def _get_access_token() -> str:
    """Exchange Client ID + Secret for a short-lived access token."""
    resp = requests.post(
        f"{PAYPAL_API_BASE}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        headers={"Accept": "application/json"},
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"PayPal auth error: {resp.status_code} — {resp.text}"
        )
    return resp.json()["access_token"]


def _paypal_headers(token: str) -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }


# ─────────────────────────────────────────────
# Public config (only exposes client_id, never the secret)
# ─────────────────────────────────────────────

@router.get("/config")
def get_paypal_config():
    """Returns only the public PayPal Client ID needed by the frontend SDK."""
    return {
        "client_id": PAYPAL_CLIENT_ID,
        "currency": "EUR",
        "mode": PAYPAL_MODE,
    }


# ─────────────────────────────────────────────
# Create order  →  returns approval_url for redirect flow
# ─────────────────────────────────────────────

@router.post("/create-order")
def create_paypal_order(
    payload: PayPalOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.subscription_type not in PLANS:
        raise HTTPException(status_code=400, detail="Plan no válido")

    plan_info        = PLANS[payload.subscription_type]
    canonical_amount = plan_info["amount"]          # server-authoritative price

    # IDEMPOTENCY — reuse a CREATED order from the last 10 min (avoids double charges)
    existing = db.query(PayPalOrder).filter(
        PayPalOrder.user_id          == current_user.id,
        PayPalOrder.subscription_type == payload.subscription_type,
        PayPalOrder.status           == "CREATED",
        PayPalOrder.created_at       >  datetime.utcnow() - timedelta(minutes=10),
    ).first()
    if existing:
        # Re-fetch the approval URL from PayPal for this existing order
        try:
            token   = _get_access_token()
            resp    = requests.get(
                f"{PAYPAL_API_BASE}/v2/checkout/orders/{existing.paypal_order_id}",
                headers=_paypal_headers(token),
                timeout=10,
            )
            if resp.status_code == 200:
                approval_url = next(
                    (l["href"] for l in resp.json().get("links", []) if l["rel"] == "approve"),
                    None
                )
                if approval_url:
                    return {"id": existing.paypal_order_id, "approval_url": approval_url}
        except Exception:
            pass  # fall through and create a new order if re-fetch fails

    # Build the order payload
    return_url = f"{FRONTEND_URL}/suscripcion/paypal-retorno"
    cancel_url = f"{FRONTEND_URL}/suscripcion?cancelled=paypal"

    order_body = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "EUR",
                "value": canonical_amount,
            },
            "description": f"Tech4U — Suscripción {plan_info['label']}",
        }],
        "application_context": {
            "brand_name": "Tech4U",
            "shipping_preference": "NO_SHIPPING",
            "user_action": "PAY_NOW",
            "return_url": return_url,
            "cancel_url": cancel_url,
            "locale": "es-ES",
        },
    }

    token = _get_access_token()
    resp  = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders",
        headers=_paypal_headers(token),
        data=json.dumps(order_body),
        timeout=15,
    )

    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=502,
            detail=f"PayPal create-order error {resp.status_code}: {resp.text}"
        )

    data = resp.json()

    # Extract approval URL from PayPal response links
    approval_url = next(
        (l["href"] for l in data.get("links", []) if l["rel"] == "approve"),
        None
    )
    if not approval_url:
        raise HTTPException(status_code=502, detail="PayPal no devolvió una URL de aprobación")

    # Persist the order in our DB
    db.add(PayPalOrder(
        user_id           = current_user.id,
        paypal_order_id   = data["id"],
        status            = "CREATED",
        amount            = float(canonical_amount),
        subscription_type = payload.subscription_type,
    ))
    db.commit()

    return {"id": data["id"], "approval_url": approval_url}


# ─────────────────────────────────────────────
# Capture order  (called after user approves on PayPal)
# ─────────────────────────────────────────────

@router.post("/capture-order/{order_id}")
def capture_paypal_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Validate the order exists in our DB and belongs to this user
    order_rec = db.query(PayPalOrder).filter(
        PayPalOrder.paypal_order_id == order_id,
        PayPalOrder.user_id         == current_user.id,
    ).first()

    if not order_rec:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    if order_rec.status == "CAPTURED":
        return {"status": "COMPLETED", "subscription_type": current_user.subscription_type}

    # 2. Capture the payment via PayPal API
    token = _get_access_token()
    resp  = requests.post(
        f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture",
        headers=_paypal_headers(token),
        timeout=15,
    )

    if resp.status_code not in (200, 201):
        order_rec.status = "FAILED"
        db.commit()
        raise HTTPException(
            status_code=502,
            detail=f"Error al capturar el pago en PayPal: {resp.text}"
        )

    capture_data = resp.json()

    if capture_data.get("status") != "COMPLETED":
        return {"status": capture_data.get("status", "UNKNOWN")}

    # 3. SECURITY: verify the captured amount matches our expected plan price
    plan_info       = PLANS.get(order_rec.subscription_type, PLANS["monthly"])
    expected_amount = float(plan_info["amount"])
    try:
        captured_amount = float(
            capture_data["purchase_units"][0]["payments"]["captures"][0]["amount"]["value"]
        )
        if abs(captured_amount - expected_amount) > 0.01:
            order_rec.status = "FAILED"
            db.commit()
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Importe capturado ({captured_amount}€) no coincide "
                    f"con el esperado ({expected_amount}€)"
                ),
            )
    except (KeyError, IndexError, TypeError, ValueError):
        pass  # unexpected PayPal response shape — proceed but don't block

    # 4. Activate subscription
    order_rec.status                = "CAPTURED"
    current_user.subscription_type  = order_rec.subscription_type
    current_user.subscription_start = datetime.utcnow()
    current_user.subscription_end   = datetime.utcnow() + timedelta(days=plan_info["days"])
    current_user.months_subscribed  = (current_user.months_subscribed or 0) + (
        1  if order_rec.subscription_type == "monthly"
        else 3  if order_rec.subscription_type == "quarterly"
        else 12
    )

    # Bonus streak shields
    bonus_shields = 2 if order_rec.subscription_type == "quarterly" else (
        4 if order_rec.subscription_type == "annual" else 0
    )
    if bonus_shields:
        current_user.streak_protections = (current_user.streak_protections or 0) + bonus_shields

    db.commit()
    return {"status": "COMPLETED", "subscription_type": current_user.subscription_type}



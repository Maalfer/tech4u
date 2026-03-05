"""
email.py — Módulo de emails transaccionales con Resend.
Para activar: añade RESEND_API_KEY al .env del backend.
Obtén tu clave gratis en https://resend.com
"""
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "Tech4U <noreply@tech4u.es>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _send(to: str, subject: str, html: str) -> bool:
    """Sends an email via Resend. Returns True on success."""
    if not RESEND_API_KEY:
        logger.warning(f"[EMAIL SKIP] RESEND_API_KEY not set. Would send '{subject}' to {to}")
        return False
    try:
        import resend  # type: ignore
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to,
            "subject": subject,
            "html": html,
        })
        logger.info(f"[EMAIL SENT] '{subject}' → {to}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL ERROR] {e}")
        return False


def _base_template(title: str, body: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html><body style="margin:0;padding:0;background:#0D0D0D;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 20px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1a1a1a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr><td style="background:#0D0D0D;padding:24px 32px;border-bottom:1px solid #1a1a1a;text-align:center;">
            <span style="font-size:22px;font-weight:900;color:#C6FF33;font-family:monospace;letter-spacing:-1px;">TECH4U</span>
            <span style="font-size:10px;color:#666;font-family:monospace;display:block;letter-spacing:4px;margin-top:2px;">ACADEMY</span>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:36px 32px;">
            <h1 style="font-size:22px;font-weight:900;color:#fff;margin:0 0 16px;text-transform:uppercase;">{title}</h1>
            {body}
          </td></tr>
          <!-- Footer -->
          <tr><td style="padding:20px 32px;border-top:1px solid #1a1a1a;text-align:center;">
            <p style="font-size:10px;color:#444;font-family:monospace;margin:0;">
              Tech4U Academy · <a href="{FRONTEND_URL}" style="color:#C6FF33;text-decoration:none;">{FRONTEND_URL}</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    </body></html>
    """


def send_welcome(to: str, nombre: str) -> bool:
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.7;">Hola <strong style="color:#fff;">{nombre}</strong>,</p>
    <p style="color:#aaa;font-size:15px;line-height:1.7;">
        Tu cuenta en <strong style="color:#C6FF33;">Tech4U Academy</strong> ha sido creada con éxito.
        Ya puedes acceder, explorar los tests y prepararte para tu FP de Informática.
    </p>
    <a href="{FRONTEND_URL}/dashboard" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:10px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
        Ir al Dashboard →
    </a>
    <p style="color:#555;font-size:12px;">Si no creaste esta cuenta, ignora este correo.</p>
    """
    return _send(to, "¡Bienvenido a Tech4U Academy! 🚀", _base_template("¡Tu cuenta está lista!", body))


def send_payment_confirmation(to: str, nombre: str, plan: str, end_date) -> bool:
    end_str = end_date.strftime("%d de %B de %Y") if end_date else "—"
    plan_label = {"monthly": "Mensual", "quarterly": "Trimestral", "annual": "Anual"}.get(plan, plan.capitalize())
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.7;">Hola <strong style="color:#fff;">{nombre}</strong>,</p>
    <p style="color:#aaa;font-size:15px;line-height:1.7;">
        Tu pago ha sido procesado correctamente. Tu suscripción <strong style="color:#C6FF33;">{plan_label}</strong> está activa.
    </p>
    <div style="background:#0D0D0D;border:1px solid #C6FF33/30;border-radius:10px;padding:16px 20px;margin:20px 0;">
        <p style="font-family:monospace;font-size:13px;color:#C6FF33;margin:4px 0;">📅 Acceso hasta: <strong>{end_str}</strong></p>
        <p style="font-family:monospace;font-size:13px;color:#aaa;margin:4px 0;">🎯 Plan: {plan_label}</p>
    </div>
    <a href="{FRONTEND_URL}/dashboard" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:10px;font-size:14px;text-transform:uppercase;">
        Empezar a estudiar →
    </a>
    """
    return _send(to, f"✅ Suscripción {plan_label} activada — Tech4U", _base_template("¡Pago confirmado!", body))


def send_expiry_warning(to: str, nombre: str, days_left: int, end_date) -> bool:
    end_str = end_date.strftime("%d/%m/%Y") if end_date else "—"
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.7;">Hola <strong style="color:#fff;">{nombre}</strong>,</p>
    <p style="color:#aaa;font-size:15px;line-height:1.7;">
        Tu suscripción expira en <strong style="color:#f87171;">{days_left} día{'s' if days_left != 1 else ''}</strong> ({end_str}).
        Para no perder el acceso, renuévala ahora.
    </p>
    <a href="{FRONTEND_URL}/suscripcion" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:10px;font-size:14px;text-transform:uppercase;">
        Renovar suscripción →
    </a>
    """
    return _send(to, f"⚠️ Tu suscripción expira en {days_left} días — Tech4U", _base_template("Aviso de vencimiento", body))

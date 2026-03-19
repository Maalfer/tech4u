import os
import logging
import resend
from typing import Optional
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

# Configuración desde variables de entorno
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Tech4U Academy <info@tech4uacademy.es>")

# Configurar la API Key de Resend
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_email(to: str, subject: str, html: str, background_tasks: Optional[BackgroundTasks] = None):
    """
    Función base para enviar emails usando Resend.
    Soporta envío síncrono o asíncrono vía BackgroundTasks.
    """
    if not RESEND_API_KEY:
        logger.warning(f"[EMAIL SKIP] RESEND_API_KEY no configurada. Destinatario: {to}, Asunto: {subject}")
        return

    def _execute_send():
        try:
            params = {
                "from": EMAIL_FROM,
                "to": to,
                "subject": subject,
                "html": html,
            }
            resend.Emails.send(params)
            logger.info(f"[EMAIL SENT] '{subject}' enviado a {to}")
        except Exception as e:
            logger.error(f"[EMAIL ERROR] Error enviando email a {to}: {str(e)}")
            # Aquí se podría añadir un fallback o reintento si fuera necesario

    if background_tasks:
        background_tasks.add_task(_execute_send)
    else:
        _execute_send()

import os
import logging
from jinja2 import Environment, FileSystemLoader, select_autoescape
from typing import Optional
from fastapi import BackgroundTasks
from utils.email import send_email

logger = logging.getLogger(__name__)

# Configuración de Jinja2 para cargar plantillas desde backend/templates/emails
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates", "emails")
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)

def render_template(template_name: str, **context) -> str:
    """Renderiza una plantilla HTML con el contexto proporcionado."""
    try:
        template = jinja_env.get_template(template_name)
        return template.render(**context)
    except Exception as e:
        logger.error(f"Error renderizando plantilla {template_name}: {str(e)}")
        raise e

def send_welcome_email(user, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un email de bienvenida tras el registro."""
    subject = f"¡Bienvenido a Tech4U, {user.nombre}! 🚀"
    html = render_template("welcome.html", user=user)
    send_email(user.email, subject, html, background_tasks)

def send_subscription_active_email(user, plan_name: str, end_date: str, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un email de confirmación de suscripción activa."""
    subject = f"✅ Tu plan {plan_name} está activo — Tech4U"
    html = render_template("subscription_active.html", user=user, plan_name=plan_name, end_date=end_date)
    send_email(user.email, subject, html, background_tasks)

def send_subscription_cancelled_email(user, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un email confirmando la cancelación de la renovación automática."""
    subject = "Suscripción cancelada — Tech4U Academy"
    html = render_template("subscription_cancelled.html", user=user)
    send_email(user.email, subject, html, background_tasks)

def send_payment_failed_email(user, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un email notificando un fallo en el pago."""
    subject = "⚠️ Problema con tu pago — Tech4U Academy"
    html = render_template("payment_failed.html", user=user)
    send_email(user.email, subject, html, background_tasks)

def send_password_reset_email(user, reset_url: str, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un email para restablecer la contraseña."""
    subject = "Restablecer tu contraseña — Tech4U Academy"
    html = render_template("password_reset.html", user=user, reset_url=reset_url)
    send_email(user.email, subject, html, background_tasks)

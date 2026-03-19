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

def send_streak_warning_email(user, streak_days: int, background_tasks: Optional[BackgroundTasks] = None):
    """Envía un recordatorio para no perder la racha."""
    subject = f"🔥 Tu racha de {streak_days} días está en peligro — Tech4U"
    html = render_template("streak_warning.html", user=user, streak_days=streak_days)
    send_email(user.email, subject, html, background_tasks)

def send_weekly_digest_email(
    user,
    xp_gained: int,
    tests_done: int,
    labs_done: int,
    streak_days: int,
    accuracy: float,
    background_tasks: Optional[BackgroundTasks] = None
):
    """Envía un resumen semanal de actividad."""
    if xp_gained >= 500:
        mood_msg = "¡Semana brutal! Estás en racha total."
    elif xp_gained >= 200:
        mood_msg = "Buena semana. Sigue construyendo el hábito."
    elif xp_gained > 0:
        mood_msg = "Algo es algo. Esta semana podemos apuntar más alto."
    else:
        mood_msg = "Esta semana no te vimos por aquí. ¡Te echamos de menos!"

    subject = f"🚀 Tu resumen semanal en Tech4U — +{xp_gained} XP"
    html = render_template(
        "weekly_digest.html",
        user=user,
        xp_gained=xp_gained,
        tests_done=tests_done,
        labs_done=labs_done,
        streak_days=streak_days,
        accuracy=int(accuracy),
        mood_msg=mood_msg
    )
    send_email(user.email, subject, html, background_tasks)

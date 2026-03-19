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
FROM_EMAIL = os.getenv("FROM_EMAIL", "Tech4U Academy <info@tech4uacademy.es>")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://tech4uacademy.es")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")


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
    first_name = nombre.split()[0] if nombre else nombre
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.8;margin:0 0 12px;">
        Hola <strong style="color:#fff;">{first_name}</strong>,
    </p>
    <p style="color:#aaa;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Bienvenido a <strong style="color:#C6FF33;">Tech4U Academy</strong> — la plataforma diseñada para
        estudiantes de <strong style="color:#fff;">ASIR y SMR</strong> que quieren ir más allá del libro de texto.
    </p>

    <!-- What you get section -->
    <div style="background:#0D0D0D;border:1px solid #1f1f1f;border-radius:12px;padding:20px 24px;margin:24px 0;">
        <p style="font-size:11px;font-family:monospace;color:#C6FF33;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">
            Lo que te espera
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:13px;color:#C6FF33;margin-right:10px;">▸</span>
                    <span style="font-size:13px;color:#ccc;">
                        <strong style="color:#fff;">Terminal Skills</strong> — Labs de Linux interactivos con corrección automática
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:13px;color:#C6FF33;margin-right:10px;">▸</span>
                    <span style="font-size:13px;color:#ccc;">
                        <strong style="color:#fff;">SQL Skills</strong> — Práctica real con bases de datos desde nivel básico
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:13px;color:#C6FF33;margin-right:10px;">▸</span>
                    <span style="font-size:13px;color:#ccc;">
                        <strong style="color:#fff;">Test Center</strong> — Más de 1.000 preguntas tipo examen de FP
                    </span>
                </td>
            </tr>
            <tr>
                <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:13px;color:#C6FF33;margin-right:10px;">▸</span>
                    <span style="font-size:13px;color:#ccc;">
                        <strong style="color:#fff;">Teoría estructurada</strong> — Redes, SO, Bases de datos, Hardware
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Completa el onboarding y en menos de 2 minutos tendrás tu primer lab listo.
        <strong style="color:#fff;">No hace falta instalar nada.</strong>
    </p>

    <a href="{FRONTEND_URL}/onboarding"
       style="display:inline-block;margin:4px 0 24px;padding:15px 32px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:12px;font-size:14px;text-transform:uppercase;letter-spacing:1.5px;font-family:monospace;">
        Empezar ahora →
    </a>

    <p style="color:#555;font-size:11px;margin:0;">
        Si no creaste esta cuenta puedes ignorar este correo sin problema.
    </p>
    """
    return _send(
        to,
        f"¡Bienvenido a Tech4U, {first_name}! Tu plataforma de FP ya está lista 🚀",
        _base_template(f"¡Hola, {first_name}!", body)
    )


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


def send_password_reset(to: str, nombre: str, reset_url: str) -> bool:
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.7;">Hola <strong style="color:#fff;">{nombre}</strong>,</p>
    <p style="color:#aaa;font-size:15px;line-height:1.7;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Si no fuiste tú, puedes ignorar este correo — tu contraseña no cambiará.
    </p>
    <a href="{reset_url}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:10px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">
        Restablecer contraseña →
    </a>
    <p style="color:#555;font-size:12px;margin-top:8px;">Este enlace expira en <strong style="color:#aaa;">1 hora</strong>.</p>
    <p style="color:#555;font-size:12px;">Si el botón no funciona, copia este enlace en tu navegador:</p>
    <p style="color:#C6FF33;font-size:11px;word-break:break-all;">{reset_url}</p>
    """
    return _send(to, "Restablece tu contraseña — Tech4U Academy", _base_template("Restablecer contraseña", body))


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


def send_streak_warning(to: str, nombre: str, streak_days: int) -> bool:
    """Sent when a user hasn't logged in for ~20h and their streak is at risk of being lost."""
    first_name = nombre.split()[0] if nombre else nombre
    flame_color = "#f97316"  # orange — urgency signal
    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.8;margin:0 0 8px;">
        ¡Ojo, <strong style="color:#fff;">{first_name}</strong>!
    </p>

    <!-- Streak warning card -->
    <div style="background:#0D0D0D;border:1px solid {flame_color}40;border-radius:14px;padding:24px;margin:20px 0;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🔥</div>
        <p style="font-family:monospace;font-size:28px;font-weight:900;color:{flame_color};margin:0 0 4px;letter-spacing:-1px;">
            {streak_days} día{'s' if streak_days != 1 else ''} de racha
        </p>
        <p style="font-size:13px;color:#aaa;margin:0;">
            Tu racha está a punto de perderse. Entra antes de medianoche para mantenerla.
        </p>
    </div>

    <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Las rachas largas desbloquean <strong style="color:#fff;">escudos de protección</strong> y
        logros exclusivos. No pierdas lo que has construido.
    </p>

    <a href="{FRONTEND_URL}/dashboard"
       style="display:inline-block;padding:14px 32px;background:{flame_color};color:#fff;font-weight:900;text-decoration:none;border-radius:12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-family:monospace;">
        Salvar mi racha 🔥
    </a>

    <p style="color:#444;font-size:11px;margin:24px 0 0;">
        Si no quieres recibir recordatorios de racha puedes ajustarlo en la configuración de tu cuenta.
    </p>
    """
    return _send(
        to,
        f"🔥 Tu racha de {streak_days} días está en peligro — Tech4U",
        _base_template(f"¡No pierdas tu racha, {first_name}!", body)
    )


def send_weekly_digest(
    to: str,
    nombre: str,
    xp_gained: int,
    tests_done: int,
    labs_done: int,
    streak_days: int,
    level: int,
    accuracy: float,
    top_subject: str = "",
) -> bool:
    """
    Weekly progress summary email. Call from a scheduled task every Monday morning.
    xp_gained: XP earned in the past 7 days
    tests_done: number of test sessions in past 7 days
    labs_done: labs completed in past 7 days
    streak_days: current streak
    level: current level
    accuracy: average accuracy % across last week's tests (0-100)
    top_subject: the subject with most activity this week
    """
    first_name = nombre.split()[0] if nombre else nombre
    accuracy_str = f"{accuracy:.0f}%" if accuracy else "—"
    top_subject_str = f" ({top_subject})" if top_subject else ""

    # Motivational message based on activity
    if xp_gained >= 500:
        mood_emoji = "🚀"
        mood_msg = "¡Semana brutal! Estás en racha total."
    elif xp_gained >= 200:
        mood_emoji = "💪"
        mood_msg = "Buena semana. Sigue construyendo el hábito."
    elif xp_gained > 0:
        mood_emoji = "📈"
        mood_msg = "Algo es algo. Esta semana podemos apuntar más alto."
    else:
        mood_emoji = "😴"
        mood_msg = "Esta semana no te vimos por aquí. ¡Te echamos de menos!"

    body = f"""
    <p style="color:#aaa;font-size:15px;line-height:1.8;margin:0 0 6px;">
        Hola <strong style="color:#fff;">{first_name}</strong>,
    </p>
    <p style="color:#aaa;font-size:14px;line-height:1.7;margin:0 0 20px;">
        {mood_emoji} {mood_msg} Aquí está tu resumen de la semana:
    </p>

    <!-- Stats grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
            <td width="50%" style="padding:0 6px 12px 0;">
                <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:12px;padding:18px;text-align:center;">
                    <p style="font-family:monospace;font-size:26px;font-weight:900;color:#C6FF33;margin:0 0 4px;">
                        +{xp_gained:,} XP
                    </p>
                    <p style="font-size:11px;color:#555;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin:0;">
                        Ganados esta semana
                    </p>
                </div>
            </td>
            <td width="50%" style="padding:0 0 12px 6px;">
                <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:12px;padding:18px;text-align:center;">
                    <p style="font-family:monospace;font-size:26px;font-weight:900;color:#fff;margin:0 0 4px;">
                        🔥 {streak_days}
                    </p>
                    <p style="font-size:11px;color:#555;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin:0;">
                        Días de racha
                    </p>
                </div>
            </td>
        </tr>
        <tr>
            <td width="50%" style="padding:0 6px 0 0;">
                <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:12px;padding:18px;text-align:center;">
                    <p style="font-family:monospace;font-size:26px;font-weight:900;color:#60a5fa;margin:0 0 4px;">
                        {tests_done} tests{top_subject_str}
                    </p>
                    <p style="font-size:11px;color:#555;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin:0;">
                        Precisión: {accuracy_str}
                    </p>
                </div>
            </td>
            <td width="50%" style="padding:0 0 0 6px;">
                <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:12px;padding:18px;text-align:center;">
                    <p style="font-family:monospace;font-size:26px;font-weight:900;color:#a78bfa;margin:0 0 4px;">
                        {labs_done} labs
                    </p>
                    <p style="font-size:11px;color:#555;font-family:monospace;text-transform:uppercase;letter-spacing:2px;margin:0;">
                        Nivel actual: {level}
                    </p>
                </div>
            </td>
        </tr>
    </table>

    <a href="{FRONTEND_URL}/dashboard"
       style="display:inline-block;padding:14px 32px;background:#C6FF33;color:#0D0D0D;font-weight:900;text-decoration:none;border-radius:12px;font-size:14px;text-transform:uppercase;letter-spacing:1.5px;font-family:monospace;">
        Ver mi progreso →
    </a>

    <p style="color:#444;font-size:11px;margin:24px 0 0;line-height:1.6;">
        Recibes este email porque tienes una cuenta activa en Tech4U Academy.<br>
        <a href="{FRONTEND_URL}/dashboard" style="color:#555;text-decoration:underline;">Gestionar preferencias de email</a>
    </p>
    """

    subject = (
        f"🚀 +{xp_gained:,} XP esta semana, {first_name} — Resumen Tech4U"
        if xp_gained > 0
        else f"👋 Te echamos de menos, {first_name} — Vuelve a Tech4U"
    )
    return _send(to, subject, _base_template("Tu semana en Tech4U", body))

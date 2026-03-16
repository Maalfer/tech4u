import logging
import os
from typing import Optional
from datetime import datetime

# Configuración del logger de seguridad
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Asegurar que el directorio de logs existe
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file = os.path.join(log_dir, "security.log")
handler = logging.FileHandler(log_file)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
security_logger.addHandler(handler)

def log_security_event(event_type: str, user_id: Optional[int], message: str, severity: str = "INFO"):
    """
    Registra un evento de seguridad de forma estructurada.
    event_type: LOGIN_FAIL, UNAUTHORIZED_ACCESS, ADMIN_ACTION, etc.
    """
    user_info = f"User ID: {user_id}" if user_id else "Anonymous"
    log_msg = f"[{event_type}] {user_info} - {message}"
    
    if severity == "WARNING":
        security_logger.warning(log_msg)
    elif severity == "ERROR":
        security_logger.error(log_msg)
    elif severity == "CRITICAL":
        security_logger.critical(log_msg)
    else:
        security_logger.info(log_msg)

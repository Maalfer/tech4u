import logging
import json
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from database import User, get_db

# Setup security logger
logger = logging.getLogger("security")
logger.setLevel(logging.INFO)
# Basic config if not already setup (FastAPI usually sets up root logger)
if not logger.handlers:
    sh = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    sh.setFormatter(formatter)
    logger.addHandler(sh)

def is_subscription_active(user: Optional[User]) -> bool:
    """Standard check for subscription active status."""
    if user is None:
        return False
    # Staff roles are always active
    if user.role in ["admin", "developer"]:
        return True
    
    sub = (user.subscription_type or "free").lower()
    if sub == "free":
        return False
        
    if user.subscription_end and user.subscription_end < datetime.utcnow():
        return False
        
    return True

def can_access_module(user: User, module_name: str, db: Session) -> bool:
    """
    Centralized logic for module access.
    Priority: Admin/Dev > Subscriber > Free.
    """
    if user.role in ["admin", "developer"]:
        return True
        
    # Standard subscription check for regular users
    has_access = is_subscription_active(user)
    if not has_access:
        logger.info(f"SECURITY: User {user.id} (FREE/EXPIRED) blocked from module '{module_name}'.")
        
    return has_access

def require_module_access(module_name: str):
    """
    FastAPI Dependency Factory to enforce module access.
    Usage: Depends(require_module_access("labs"))
    """
    from auth import get_current_user # Avoid circular import
    
    def dependency(
        request: Request,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not can_access_module(current_user, module_name, db):
            logger.warning(f"SECURITY: Blocked access to {request.url.path} for user {current_user.id} (Module: {module_name})")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: se requiere una suscripción activa para acceder al módulo '{module_name}'."
            )
        return current_user
        
    return dependency

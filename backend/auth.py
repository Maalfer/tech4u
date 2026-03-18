from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, User
from services.permission_service import is_subscription_active as perm_sub_active # for internal use if needed
import os
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURACIÓN ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY no configurada. Verifica el archivo .env")

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

bearer_scheme = HTTPBearer()
bearer_scheme_optional = HTTPBearer(auto_error=False)   # For public endpoints
router = APIRouter(prefix="/auth", tags=["Auth"])

# --- ESQUEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

# --- FUNCIONES DE UTILIDAD ---

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    # SEC-05: el campo 'ver' (token_version) permite invalidar tokens sin lista negra
    # Se incluye en el payload; get_current_user lo verifica contra la BD
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- DEPENDENCIAS DE SEGURIDAD (CORREGIDAS Y COMPLETAS) ---

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_optional),
    db: Session = Depends(get_db),
) -> User:
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Try tech4u_token (httpOnly cookie) first, then fall back to access_token for backward compat
        token = request.cookies.get("tech4u_token") or request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # SEC-05 FIX: validar token_version para permitir revocación inmediata de sesiones.
    # Si el admin o el propio usuario cambia la contraseña, token_version se incrementa
    # y todos los tokens anteriores quedan automáticamente invalidados.
    token_ver = payload.get("ver", 0)
    db_ver = user.token_version or 0
    if int(token_ver) != int(db_ver):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión revocada. Por favor, inicia sesión de nuevo.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Like get_current_user but returns None instead of 401 when no/invalid token.
    Use this on public endpoints that also serve authenticated users."""
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Try tech4u_token (httpOnly cookie) first, then fall back to access_token for backward compat
        token = request.cookies.get("tech4u_token") or request.cookies.get("access_token")

    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            return None
        # SEC-05 FIX: validar token_version también en rutas opcionales
        token_ver = payload.get("ver", 0)
        db_ver = user.token_version or 0
        if int(token_ver) != int(db_ver):
            return None
        return user
    except Exception:
        return None

def is_subscription_active(user: Optional[User]) -> bool:
    """Delegates to permission service."""
    from services.permission_service import is_subscription_active as sub_check
    return sub_check(user)

def require_subscription(current_user: User = Depends(get_current_user)) -> User:
    """Middleware: El usuario debe ser admin/developer o tener plan activo."""
    if current_user.role in ["admin", "developer"]:

        return current_user
        
    sub_type = current_user.subscription_type.lower() if current_user.subscription_type else "free"
        
    if sub_type == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere suscripción activa.",
        )
    
    if current_user.subscription_end and current_user.subscription_end < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Suscripción expirada.",
        )
    return current_user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Privilegios de admin requeridos.")
    return current_user

def require_developer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "developer"]:
        raise HTTPException(status_code=403, detail="Privilegios de desarrollador requeridos.")
    return current_user



def require_management(current_user: User = Depends(get_current_user)) -> User:
    """Permite el paso a Admin y Desarrolladores para gestión."""
    if current_user.role not in ["admin", "developer"]:
        raise HTTPException(
            status_code=403, 
            detail="Privilegios de gestión requeridos (Admin o Developer)."
        )
    return current_user


# require_module_access moved to services/permission_service.py

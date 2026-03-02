from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, User
import os
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURACIÓN ---
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

bearer_scheme = HTTPBearer()
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
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

def require_subscription(current_user: User = Depends(get_current_user)) -> User:
    """Middleware: El usuario debe ser admin/docente o tener plan activo."""
    if current_user.role in ["admin", "docente"]:
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

def require_docente(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "docente"]:
        raise HTTPException(status_code=403, detail="Privilegios de docente requeridos.")
    return current_user

def require_management(current_user: User = Depends(get_current_user)) -> User:
    """Permite el paso a Admin y Docentes para gestión de contenido."""
    if current_user.role not in ["admin", "docente"]:
        raise HTTPException(
            status_code=403, 
            detail="Privilegios de gestión requeridos (Admin o Docente)."
        )
    return current_user

# --- ENDPOINT DE LOGIN ---

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "role": user.role,
            "subscription_type": user.subscription_type, 
            "subscription_end": user.subscription_end.isoformat() if user.subscription_end else None
        }
    }
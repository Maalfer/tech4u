from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Coupon, User
from auth import require_management
from schemas import CouponCreate, CouponOut

router = APIRouter(prefix="/admin/coupons", tags=["Admin Coupons"])

@router.get("/", response_model=List[CouponOut])
def list_coupons(
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Devuelve todos los cupones creados."""
    return db.query(Coupon).all()

@router.post("/", response_model=CouponOut)
def create_coupon(
    data: CouponCreate,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Crea un nuevo cupón."""
    # Verificar si el código ya existe
    existing = db.query(Coupon).filter(Coupon.code == data.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este código de cupón ya existe.")
        
    c = Coupon(
        code=data.code.upper(),
        discount_percent=data.discount_percent,
        max_uses=data.max_uses,
        is_active=data.is_active,
        assigned_to_id=data.assigned_to_id
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Elimina un cupón."""
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    db.delete(c)
    db.commit()
    return {"message": "Cupón eliminado"}

@router.put("/{coupon_id}/toggle", response_model=CouponOut)
def toggle_coupon_status(
    coupon_id: int,
    _: User = Depends(require_management),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Activa o desactiva un cupón."""
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón no encontrado")
    
    c.is_active = not c.is_active
    db.commit()
    db.refresh(c)
    return c

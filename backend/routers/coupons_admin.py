from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from datetime import datetime
from database import get_db, Coupon, User
from auth import require_admin
from schemas import CouponCreate, CouponBulkCreate, CouponOut

router = APIRouter(prefix="/admin/coupons", tags=["Admin Coupons"])


@router.get("/", response_model=List[CouponOut])
def list_coupons(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Devuelve todos los cupones creados, ordenados por fecha."""
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()


@router.post("/", response_model=CouponOut)
def create_coupon(
    data: CouponCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    (Admin/Docente) Crea un nuevo cupón.
    - Si `assigned_to_email` se proporciona, busca el usuario y bloquea el cupón a él.
    - Si `expires_at` se proporciona, el cupón expirará en esa fecha.
    - `applicable_plans`: 'all' | 'monthly' | 'quarterly' | 'annual'
    """
    code = data.code.upper().strip()

    # Verificar unicidad del código
    existing = db.query(Coupon).filter(Coupon.code == code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este código de cupón ya existe.")

    # Resolver usuario por email si se proporcionó
    assigned_to_id = data.assigned_to_id
    if data.assigned_to_email and not assigned_to_id:
        user = db.query(User).filter(
            User.email.ilike(data.assigned_to_email.strip())
        ).first()
        if user:
            assigned_to_id = user.id
        # Si no se encuentra el usuario, se crea el cupón sin asignación (no es error)

    try:
        c = Coupon(
            code=code,
            discount_percent=data.discount_percent,
            max_uses=data.max_uses,
            is_active=data.is_active,
            assigned_to_id=assigned_to_id,
            description=data.description,
            expires_at=data.expires_at,
            applicable_plans=data.applicable_plans or "all",
        )
        db.add(c)
        db.commit()
        db.refresh(c)
        return c
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar el cupón en la base de datos.")


@router.post("/bulk", response_model=List[CouponOut])
def create_bulk_coupons(
    data: CouponBulkCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    (Admin/Docente) Crea cupones individuales para un grupo o clase completa.

    Por cada email en la lista genera un código único con el prefijo indicado,
    bloqueado a ese usuario si existe en la base de datos.

    Ejemplo: prefix=ASIR1A, emails=[a@b.com, c@d.com] → ASIR1A_001, ASIR1A_002
    """
    prefix = data.code_prefix.upper().strip()
    created = []
    errors = []

    for idx, email in enumerate(data.emails):
        email = email.strip()
        if not email:
            continue

        code = f"{prefix}_{str(idx + 1).zfill(3)}"

        # Verificar que el código no exista
        if db.query(Coupon).filter(Coupon.code == code).first():
            # Añadir sufijo extra para garantizar unicidad
            code = f"{prefix}_{str(idx + 1).zfill(3)}X"

        # Intentar asociar al usuario
        assigned_to_id = None
        user = db.query(User).filter(User.email.ilike(email)).first()
        if user:
            assigned_to_id = user.id

        try:
            c = Coupon(
                code=code,
                discount_percent=data.discount_percent,
                max_uses=1,
                is_active=True,
                assigned_to_id=assigned_to_id,
                description=data.description or f"Cupón grupo: {data.group_name}",
                expires_at=data.expires_at,
                applicable_plans="all",
            )
            db.add(c)
            db.flush()  # obtener el id sin commit total aún
            created.append(c)
        except SQLAlchemyError as e:
            errors.append(f"Error con {email}: {str(e)}")

    try:
        db.commit()
        for c in created:
            db.refresh(c)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar los cupones masivos.")

    return created


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Elimina un cupón."""
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón no encontrado.")
    db.delete(c)
    db.commit()
    return {"message": "Cupón eliminado."}


@router.put("/{coupon_id}/toggle", response_model=CouponOut)
def toggle_coupon_status(
    coupon_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Activa o desactiva un cupón."""
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón no encontrado.")

    try:
        c.is_active = not c.is_active
        db.commit()
        db.refresh(c)
        return c
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar el estado del cupón.")


@router.put("/{coupon_id}", response_model=CouponOut)
def update_coupon(
    coupon_id: int,
    data: CouponCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """(Admin/Docente) Actualiza los campos de un cupón existente."""
    c = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cupón no encontrado.")

    # Comprobar si el nuevo código ya existe en otro cupón
    code = data.code.upper().strip()
    if code != c.code:
        conflict = db.query(Coupon).filter(Coupon.code == code).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Ese código ya está en uso.")

    c.code = code
    c.discount_percent = data.discount_percent
    c.max_uses = data.max_uses
    c.is_active = data.is_active
    c.description = data.description
    c.expires_at = data.expires_at
    c.applicable_plans = data.applicable_plans or "all"

    if data.assigned_to_email and not data.assigned_to_id:
        user = db.query(User).filter(User.email.ilike(data.assigned_to_email.strip())).first()
        c.assigned_to_id = user.id if user else None
    else:
        c.assigned_to_id = data.assigned_to_id

    try:
        db.commit()
        db.refresh(c)
        return c
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar el cupón.")

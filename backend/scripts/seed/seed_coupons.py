from database import SessionLocal, Coupon
from datetime import datetime

def run():
    db = SessionLocal()
    try:
        # 1. BIENVENIDA100 (100% bypass)
        existing = db.query(Coupon).filter(Coupon.code == "BIENVENIDA100").first()
        if not existing:
            new_coupon = Coupon(
                code="BIENVENIDA100",
                discount_percent=100.0,
                max_uses=1000,
                current_uses=0,
                is_active=True,
                description="Acceso total gratuito (Bypass Stripe)",
                applicable_plans="all"
            )
            db.add(new_coupon)
            print("  ✅ Coupon BIENVENIDA100 created")
        
        # 2. BIENVENIDO15 (15% standard)
        existing_15 = db.query(Coupon).filter(Coupon.code == "BIENVENIDO15").first()
        if not existing_15:
            new_coupon_15 = Coupon(
                code="BIENVENIDO15",
                discount_percent=15.0,
                max_uses=500,
                current_uses=0,
                is_active=True,
                description="Descuento de bienvenida 15%",
                applicable_plans="all"
            )
            db.add(new_coupon_15)
            print("  ✅ Coupon BIENVENIDO15 created")

        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run()

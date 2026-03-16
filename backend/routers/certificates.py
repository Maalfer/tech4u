from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
import hashlib
import io
import os
import tempfile

from database import get_db, User, UserSQLProgress, SQLExercise
from auth import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificates"])

# Try to import PDF libraries
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
    from reportlab.lib.colors import HexColor
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# ─────────────────────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def is_user_eligible_for_sql_certificate(db: Session, user: User) -> bool:
    """
    Check if user is eligible for SQL certificate.

    Criteria:
    - User is NOT free tier (has an active subscription), OR
    - User is admin/developer role
    """
    if user.subscription_type != "free":
        return True

    if user.role in ["admin", "developer"]:
        return True

    return False

def generate_certificate_id(user_id: int, date: datetime) -> str:
    """Generate a unique certificate ID based on user_id and date."""
    hash_input = f"{user_id}:{date.isoformat()}"
    return hashlib.sha256(hash_input.encode()).hexdigest()[:16].upper()

def generate_certificate_pdf(user: User, certificate_id: str) -> bytes:
    """
    Generate a PDF certificate using ReportLab.

    Design:
    - Dark background (#0D0D0D)
    - "Tech4U Academy" header
    - "CERTIFICADO DE COMPLETADO" title
    - "SQL Skills Path — Fundamentos y Consultas Avanzadas"
    - Student name
    - Date issued
    - Certificate ID
    - Footer with tech4u.academy
    """

    if not HAS_REPORTLAB:
        raise RuntimeError("ReportLab not available")

    # Create PDF in memory
    pdf_buffer = io.BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    width, height = letter

    # Dark background
    c.setFillColor(HexColor("#0D0D0D"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # --- Header ---
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 28)
    c.drawString(width / 2 - 150, height - 80, "Tech4U Academy")

    # --- Title ---
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(HexColor("#00D9FF"))  # Cyan accent
    c.drawString(width / 2 - 180, height - 150, "CERTIFICADO DE COMPLETADO")

    # --- Subtitle ---
    c.setFont("Helvetica", 14)
    c.setFillColor(HexColor("#CCCCCC"))
    c.drawString(width / 2 - 190, height - 200, "SQL Skills Path — Fundamentos y Consultas Avanzadas")

    # --- Student Name ---
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(HexColor("#FFFFFF"))
    c.drawString(width / 2 - 100, height - 300, f"Estudiante: {user.nombre}")

    # --- Date Issued ---
    today = datetime.utcnow().strftime("%d/%m/%Y")
    c.setFont("Helvetica", 12)
    c.setFillColor(HexColor("#AAAAAA"))
    c.drawString(width / 2 - 120, height - 350, f"Emitido: {today}")

    # --- Certificate ID ---
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#888888"))
    c.drawString(width / 2 - 140, height - 400, f"ID Certificado: {certificate_id}")

    # --- Decorative Line ---
    c.setStrokeColor(HexColor("#00D9FF"))
    c.setLineWidth(2)
    c.line(100, height - 450, width - 100, height - 450)

    # --- Footer ---
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#999999"))
    c.drawString(width / 2 - 80, 50, "tech4u.academy")

    c.save()
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()

# ─────────────────────────────────────────────────────────────────────────────
# GET /certificates/sql
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/sql")
def get_sql_certificate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and return a PDF certificate for SQL Skills Path.

    Requirements:
    - User must be subscribed (not free tier) OR admin/developer
    - Returns a PDF file if available, otherwise returns JSON with certificate data
    """

    # Check eligibility
    if not is_user_eligible_for_sql_certificate(db, current_user):
        raise HTTPException(
            status_code=403,
            detail="You must have an active subscription to download certificates"
        )

    # Generate certificate ID
    today = datetime.utcnow()
    certificate_id = generate_certificate_id(current_user.id, today)

    # Try to generate PDF
    if HAS_REPORTLAB:
        try:
            pdf_bytes = generate_certificate_pdf(current_user, certificate_id)

            # Return as file download
            return FileResponse(
                io.BytesIO(pdf_bytes),
                media_type="application/pdf",
                filename=f"certificate_sql_{current_user.id}_{today.strftime('%Y%m%d')}.pdf"
            )
        except Exception as e:
            print(f"Error generating PDF: {e}")
            # Fall through to JSON response

    # Fallback: return JSON with certificate data
    return JSONResponse({
        "status": "success",
        "certificate": {
            "student_name": current_user.nombre,
            "title": "CERTIFICADO DE COMPLETADO",
            "path": "SQL Skills Path — Fundamentos y Consultas Avanzadas",
            "issued_date": today.isoformat(),
            "certificate_id": certificate_id,
            "academy": "Tech4U Academy",
            "website": "tech4u.academy",
        },
        "message": "PDF generation not available, here is your certificate data",
    })

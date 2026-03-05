from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db, User, Ticket, TicketMessage
from auth import get_current_user
from schemas import TicketCreate, TicketOut, TicketMessageCreate, TicketMessageOut
from datetime import datetime

router = APIRouter(prefix="/support", tags=["Support"])

@router.post("/tickets", response_model=TicketOut)
def create_ticket(
    data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo ticket de soporte o incidencia."""
    new_ticket = Ticket(
        user_id=current_user.id,
        subject=data.subject,
        description=data.description,
        status="pendiente"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("/my-tickets", response_model=List[TicketOut])
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Devuelve los tickets enviados por el usuario actual que NO están resueltos."""
    return db.query(Ticket).options(joinedload(Ticket.messages)).filter(
        Ticket.user_id == current_user.id,
        Ticket.status != "resuelto"
    ).order_by(Ticket.created_at.desc()).all()


@router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageOut)
def reply_to_ticket(
    ticket_id: int,
    data: TicketMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """(Alumno) Envía un mensaje en el hilo del ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.user_id == current_user.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado o no autorizado")
    
    if ticket.status == "resuelto":
        raise HTTPException(status_code=400, detail="El ticket ya está resuelto, no puedes enviar más mensajes.")
        
    msg = TicketMessage(
        ticket_id=ticket.id,
        sender_role="alumno",
        content=data.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

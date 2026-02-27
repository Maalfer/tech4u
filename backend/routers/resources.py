from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Resource, User
from auth import get_current_user, require_subscription
from schemas import ResourceOut

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=List[ResourceOut])
def get_resources(
    current_user: User = Depends(require_subscription),
    db: Session = Depends(get_db),
):
    """Return all resources. Requires active subscription."""
    return db.query(Resource).all()


@router.get("/free", response_model=List[ResourceOut])
def get_free_resources(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return free resources (no subscription required)."""
    return db.query(Resource).filter(Resource.requires_subscription == False).all()

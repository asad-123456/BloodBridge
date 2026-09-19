from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.inventory import controller
from src.inventory.dtos import InventoryResponseDTO, InventoryUpdateDTO
from src.organizations.controller import get_current_organization
from src.organizations.models import Organization
from src.utils.database import get_db

router = APIRouter(prefix="/inventory", tags=["Partner Inventory"])


@router.get("", response_model=List[InventoryResponseDTO])
def get_inventory(
    db: Session = Depends(get_db),
    current_org: Organization = Depends(get_current_organization),
):
    return controller.get_inventory(db, current_org)


@router.post("/update", response_model=InventoryResponseDTO)
def update_stock(
    data: InventoryUpdateDTO,
    db: Session = Depends(get_db),
    current_org: Organization = Depends(get_current_organization),
):
    return controller.update_stock(data, db, current_org)

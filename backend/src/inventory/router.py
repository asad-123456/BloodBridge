from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.inventory.dtos import InventoryResponseDTO, InventoryUpdateDTO
from src.inventory.models import BloodInventory
from src.organizations.controller import get_current_organization
from src.organizations.models import Organization
from src.utils.database import get_db

router = APIRouter(prefix="/inventory", tags=["Partner Inventory"])


@router.get("", response_model=List[InventoryResponseDTO])
def get_inventory(
    db: Session = Depends(get_db),
    current_org: Organization = Depends(get_current_organization),
):
    return (
        db.query(BloodInventory)
        .filter(BloodInventory.organization_id == current_org.id)
        .all()
    )


@router.post("/update", response_model=InventoryResponseDTO)
def update_stock(
    data: InventoryUpdateDTO,
    db: Session = Depends(get_db),
    current_org: Organization = Depends(get_current_organization),
):
    item = (
        db.query(BloodInventory)
        .filter(BloodInventory.organization_id == current_org.id)
        .filter(BloodInventory.blood_group == data.blood_group)
        .filter(BloodInventory.component_type == data.component_type)
        .first()
    )

    if item is None:
        item = BloodInventory(
            organization_id=current_org.id,
            blood_group=data.blood_group,
            component_type=data.component_type,
            units_available=data.units,
        )
        db.add(item)
    else:
        item.units_available = data.units

    db.commit()
    db.refresh(item)
    return item

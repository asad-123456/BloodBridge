
from sqlalchemy.orm import Session

from src.inventory.dtos import InventoryUpdateDTO
from src.inventory.models import BloodInventory
from src.organizations.models import Organization


def get_inventory(db: Session, current_org: Organization) -> list[BloodInventory]:
    return (
        db.query(BloodInventory)
        .filter(BloodInventory.organization_id == current_org.id)
        .all()
    )


def update_stock(data: InventoryUpdateDTO, db: Session, current_org: Organization) -> BloodInventory:
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

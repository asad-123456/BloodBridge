from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class InventoryUpdateDTO(BaseModel):
    blood_group: str
    component_type: str = "Whole Blood"
    units: int = Field(ge=0)


class InventoryResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    blood_group: str
    component_type: str
    units_available: int
    last_updated: datetime

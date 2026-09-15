import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from src.utils.database import Base


class BloodInventory(Base):
    __tablename__ = "blood_inventories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    blood_group = Column(String(5), nullable=False)
    component_type = Column(String(50), nullable=False, default="Whole Blood")
    units_available = Column(Integer, nullable=False, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", backref="inventories")

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.utils.database import Base


class SafetyFlag(Base):
    __tablename__ = "safety_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), nullable=False)
    reported_user_id = Column(UUID(as_uuid=True), nullable=False)
    request_id = Column(UUID(as_uuid=True), ForeignKey("blood_requests.id"), nullable=True)
    category = Column(String(30), nullable=False)
    excerpt = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open")
    resolution_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(String(100), nullable=False)
    actor_name = Column(String(200), nullable=False)
    action = Column(String(200), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(100), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    note = Column(Text, nullable=True)
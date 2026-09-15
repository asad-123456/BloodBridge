import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ApprovalDecision(BaseModel):
    approve: bool  # True = approved, False = rejected


class AdminUserOut(BaseModel):
    id: uuid.UUID
    name: str
    role: str
    phone: str
    email: EmailStr
    institution_id: uuid.UUID | None = None
    is_active: bool
    created_at: datetime | None = None


class UserStatusUpdate(BaseModel):
    is_active: bool


class SafetyFlagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reporter_id: uuid.UUID
    reported_user_id: uuid.UUID
    request_id: uuid.UUID | None
    category: str
    excerpt: str
    status: str
    resolution_note: str | None
    created_at: datetime


class SafetyFlagResolution(BaseModel):
    action: str = Field(pattern="^(resolved|dismissed)$")
    resolution_note: str = Field(min_length=1, max_length=500)


class AuditEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    actor_id: str
    actor_name: str
    action: str
    target_type: str
    target_id: str
    timestamp: datetime
    note: str | None


class MetricsOut(BaseModel):
    total_requests: int
    fulfilled_requests: int
    units_required: int
    units_fulfilled: int
    open_safety_flags: int
    partner_claims: int

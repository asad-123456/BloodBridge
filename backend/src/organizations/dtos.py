import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.utils.enums import ApprovalStatus, BloodType, RequestStatus, UrgencyLevel
from src.utils.validators import Address, Latitude, Longitude, Name, Password, Phone


class OrganizationSignup(BaseModel):
    name: Name
    email: EmailStr
    phone: Phone
    password: Password
    address: Address
    latitude: Latitude
    longitude: Longitude


class OrganizationLogin(BaseModel):
    email: EmailStr
    password: str


class OrganizationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str
    address: str
    logo_url: str | None
    approval_status: ApprovalStatus
    is_email_verified: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PartnerRequestCreate(BaseModel):
    blood_type_needed: BloodType
    units_needed: int = Field(gt=0)
    urgency_level: UrgencyLevel
    required_by: datetime
    hospital_name: str | None = None
    area_label: str | None = None


class PartnerRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    requestor_id: uuid.UUID | None
    organization_id: uuid.UUID | None
    blood_type_needed: BloodType
    units_needed: int
    units_secured: int
    urgency_level: UrgencyLevel
    required_by: datetime
    hospital_name_text: str | None
    hospital_id: uuid.UUID | None
    is_hospital_backed: bool
    status: RequestStatus
    current_radius_km: float
    contact_phone: str
    area_label: str | None
    created_at: datetime


class PartnerFulfillmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    blood_request_id: uuid.UUID
    organization_id: uuid.UUID | None
    units_committed: int
    status: str
    accepted_at: datetime
    handover_at: datetime | None
    confirmed_at: datetime | None

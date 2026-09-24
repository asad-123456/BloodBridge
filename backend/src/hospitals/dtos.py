import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from src.utils.enums import ApprovalStatus
from src.utils.validators import Address, Latitude, Longitude, Name, Password, Phone


class HospitalSignup(BaseModel):
    name: Name
    email: EmailStr
    phone: Phone
    password: Password
    address: Address
    latitude: Latitude
    longitude: Longitude
    
    # Verification Fields
    license_number: str
    facility_type: str
    contact_person_name: str
    contact_person_designation: str
    website_url: str | None = None


class HospitalLogin(BaseModel):
    email: EmailStr
    password: str


class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str
    address: str
    logo_url: str | None
    
    license_number: str | None
    facility_type: str | None
    contact_person_name: str | None
    contact_person_designation: str | None
    website_url: str | None
    
    approval_status: ApprovalStatus
    is_email_verified: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from src.utils.enums import BloodType
from src.utils.validators import (
    Label,
    Latitude,
    Longitude,
    Name,
    Password,
    Phone,
)


class DonorSignup(BaseModel):
    full_name: Name
    email: EmailStr
    phone: Phone
    password: Password
    blood_type: BloodType
    latitude: Latitude | None = None
    longitude: Longitude | None = None
    address: Label | None = None


class DonorLogin(BaseModel):
    email: EmailStr
    password: str


class DonorUpdateLocation(BaseModel):
    latitude: Latitude | None = None
    longitude: Longitude | None = None
    area_label: Label


class DonorUpdateProfile(BaseModel):
    full_name: Name | None = None
    phone: Phone | None = None
    blood_type: BloodType | None = None




class DonorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: str
    blood_type: BloodType
    profile_pic_url: str | None
    area_label: str | None
    is_email_verified: bool
    is_active: bool
    eligible_after: datetime | None
    reliability_score: int
    created_at: datetime

    latitude: float | None = None
    longitude: float | None = None

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: Password

class DonorStatsOut(BaseModel):
    units_donated: int
    lives_impacted: int
    donations_count: int
    badges: list[str]
    eligible_after: datetime | None = None
    blood_type: BloodType



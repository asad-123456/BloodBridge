from sqlalchemy.orm import selectinload
from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.blood_requests.models import BloodRequest
from src.organizations import dtos
from src.organizations.models import Organization
from src.request_matches.models import RequestMatch
from src.utils import accounts
from src.utils.auth import get_current_entity
from src.utils.cloudinary_utils import upload_image
from src.utils.constants import DEFAULT_RADIUS_KM
from src.utils.enums import MatchStatus, RequestStatus
from src.utils.geo import make_point
from src.utils.settings import settings
from src.utils.helpers import create_access_token, hash_password, verify_password

ROLE = "organization"

get_current_organization = get_current_entity(ROLE)


def signup(data: dtos.OrganizationSignup, db: Session) -> Organization:
    if data.email == settings.ADMIN_EMAIL:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email reserved for system administrator")
    if db.query(Organization).filter(Organization.email == data.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    if db.query(Organization).filter(Organization.name == data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Organization name already registered"
        )

    org = Organization(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        address=data.address,
        location=make_point(data.latitude, data.longitude),
        license_number=data.license_number,
        facility_type=data.facility_type,
        contact_person_name=data.contact_person_name,
        contact_person_designation=data.contact_person_designation,
        website_url=data.website_url,
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def login(data: dtos.OrganizationLogin, db: Session) -> str:
    org = db.query(Organization).filter(Organization.email == data.email).first()
    if not org or not verify_password(data.password, org.password_hash):
        raise accounts.invalid_credentials()
    # Admin approval is the gate for this role; there is no email flow to check.
    accounts.assert_can_login(org, require_verification=False)
    return create_access_token({"id": str(org.id), "role": ROLE})


def upload_logo(org: Organization, file: UploadFile, db: Session) -> Organization:
    org.logo_url = upload_image(file, folder="bloodbridge/organizations")
    db.commit()
    db.refresh(org)
    return org


def list_external_requests(org: Organization, db: Session) -> list[BloodRequest]:
    return (
        db.query(BloodRequest)
        .filter(BloodRequest.organization_id.is_distinct_from(org.id))
        .filter(BloodRequest.status.in_((RequestStatus.ACTIVE, RequestStatus.PARTIALLY_MATCHED)))
        .filter(BloodRequest.units_secured < BloodRequest.units_needed)
        .order_by(BloodRequest.required_by.asc())
        .all()
    )


def list_own_requests(org: Organization, db: Session) -> list[BloodRequest]:
    return db.query(BloodRequest).filter(BloodRequest.organization_id == org.id).order_by(BloodRequest.created_at.desc()).all()


def list_fulfillments(org: Organization, db: Session) -> list[RequestMatch]:
    return db.query(RequestMatch).filter(RequestMatch.organization_id == org.id).order_by(RequestMatch.accepted_at.desc()).all()


def create_partner_request(data: dtos.PartnerRequestCreate, org: Organization, db: Session) -> BloodRequest:
    request = BloodRequest(
        organization_id=org.id,
        patient_name=f"{org.name} blood bank",
        blood_type_needed=data.blood_type_needed,
        units_needed=data.units_needed,
        urgency_level=data.urgency_level,
        required_by=data.required_by,
        hospital_name_text=data.hospital_name,
        is_hospital_backed=False,
        status=RequestStatus.ACTIVE,
        current_radius_km=DEFAULT_RADIUS_KM[data.urgency_level],
        contact_phone=org.phone,
        location=org.location,
        area_label=data.area_label or org.address,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def update_fulfillment(match_id: str, org: Organization, action: str, db: Session) -> RequestMatch:
    match = db.query(RequestMatch).filter(RequestMatch.id == match_id, RequestMatch.organization_id == org.id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fulfillment not found")
    if action == "handover":
        if match.status != MatchStatus.ACCEPTED:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Fulfillment is not awaiting handover")
        match.handover_at = datetime.now(timezone.utc)
    else:
        if match.handover_at is None or match.confirmed_at is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Handover must be recorded first")
        match.confirmed_at = datetime.now(timezone.utc)
        match.status = MatchStatus.COMPLETED
        blood_requests_controller.mark_fulfilled_if_complete(match.blood_request_id, db)
        match.completed_at = match.confirmed_at
    db.commit()
    db.refresh(match)
    return match

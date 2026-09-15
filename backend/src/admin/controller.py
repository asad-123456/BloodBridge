from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.admin import dtos
from src.hospitals.models import Hospital
from src.organizations.models import Organization
from src.donors.models import Donor
from src.requestors.models import Requestor
from src.admin.activity_models import AuditEvent, SafetyFlag
from src.request_matches.models import RequestMatch
from src.utils.auth import require_roles
from src.utils.enums import ApprovalStatus
from src.utils.helpers import constant_time_equals, create_access_token
from src.utils.settings import settings

get_current_admin = require_roles("admin")

USER_MODELS = {
    "donor": (Donor, "full_name", None),
    "requestor": (Requestor, "full_name", None),
    "hospital": (Hospital, "name", "hospital"),
    "organization": (Organization, "name", "organization"),
}


def login(data: dtos.AdminLogin) -> str:
    if not settings.admin_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured on this server",
        )

    # Both comparisons always run, and both are constant-time: `!=` on the
    # secret leaked its common prefix length, and short-circuiting on the email
    # would reveal whether the address was the right one.
    actual_email_ok = constant_time_equals(data.email, settings.ADMIN_EMAIL)
    actual_password_ok = constant_time_equals(data.password, settings.ADMIN_PASSWORD)
    demo_email_ok = constant_time_equals(data.email, settings.DEMO_ADMIN_EMAIL)
    demo_password_ok = constant_time_equals(data.password, settings.DEMO_ADMIN_PASSWORD)
    if not (
        (actual_email_ok and actual_password_ok)
        or (demo_email_ok and demo_password_ok)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return create_access_token({"id": "admin", "role": "admin"})


def list_pending_hospitals(db: Session) -> list[Hospital]:
    return db.query(Hospital).filter(Hospital.approval_status == ApprovalStatus.PENDING).all()


def decide_hospital(hospital_id: str, decision: dtos.ApprovalDecision, db: Session) -> Hospital:
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    hospital.approval_status = ApprovalStatus.APPROVED if decision.approve else ApprovalStatus.REJECTED
    db.commit()
    db.refresh(hospital)
    return hospital


def list_pending_organizations(db: Session) -> list[Organization]:
    return db.query(Organization).filter(Organization.approval_status == ApprovalStatus.PENDING).all()


def decide_organization(org_id: str, decision: dtos.ApprovalDecision, db: Session) -> Organization:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    org.approval_status = ApprovalStatus.APPROVED if decision.approve else ApprovalStatus.REJECTED
    db.commit()
    db.refresh(org)
    return org


def _normalize_user(entity, role: str, name_field: str, institution_role: str | None) -> dtos.AdminUserOut:
    return dtos.AdminUserOut(
        id=entity.id,
        name=getattr(entity, name_field),
        role=role,
        phone=entity.phone,
        email=entity.email,
        institution_id=entity.id if institution_role else None,
        is_active=getattr(entity, "is_active", True),
        created_at=entity.created_at,
    )


def list_users(db: Session) -> list[dtos.AdminUserOut]:
    users = []
    for role, (model, name_field, institution_role) in USER_MODELS.items():
        entities = db.query(model).order_by(model.created_at.desc()).all()
        users.extend(_normalize_user(entity, role, name_field, institution_role) for entity in entities)
    return sorted(
        users,
        key=lambda user: user.created_at.timestamp() if user.created_at else 0,
        reverse=True,
    )


def update_user_status(
    user_role: str,
    user_id: str,
    data: dtos.UserStatusUpdate,
    db: Session,
) -> dtos.AdminUserOut:
    model_info = USER_MODELS.get(user_role)
    if not model_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported user role")
    model, name_field, institution_role = model_info
    entity = db.query(model).filter(model.id == user_id).first()
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    entity.is_active = data.is_active
    db.commit()
    db.refresh(entity)
    return _normalize_user(entity, user_role, name_field, institution_role)


def list_safety_flags(db: Session) -> list[SafetyFlag]:
    return db.query(SafetyFlag).order_by(SafetyFlag.created_at.desc()).all()


def resolve_safety_flag(flag_id: str, data: dtos.SafetyFlagResolution, db: Session, admin_id: str) -> SafetyFlag:
    flag = db.query(SafetyFlag).filter(SafetyFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety flag not found")
    flag.status = data.action
    flag.resolution_note = data.resolution_note
    db.add(AuditEvent(
        actor_id=admin_id,
        actor_name="Platform administrator",
        action=f"{data.action.capitalize()} safety flag",
        target_type="Safety flag",
        target_id=str(flag.id),
        note=data.resolution_note,
    ))
    db.commit()
    db.refresh(flag)
    return flag


def list_audit_events(db: Session) -> list[AuditEvent]:
    return db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(200).all()


def metrics(db: Session) -> dtos.MetricsOut:
    requests = db.query(BloodRequest).all()
    return dtos.MetricsOut(
        total_requests=len(requests),
        fulfilled_requests=sum(item.status.value == "fulfilled" for item in requests),
        units_required=sum(item.units_needed for item in requests),
        units_fulfilled=sum(item.units_secured for item in requests),
        open_safety_flags=db.query(SafetyFlag).filter(SafetyFlag.status == "open").count(),
        partner_claims=db.query(RequestMatch).count(),
    )

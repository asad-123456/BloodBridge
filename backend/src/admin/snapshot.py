from sqlalchemy.orm import Session

from src.admin.activity_models import AuditEvent, SafetyFlag
from src.blood_requests.models import BloodRequest
from src.donors.models import Donor
from src.hospitals.models import Hospital
from src.organizations.models import Organization
from src.request_matches.models import RequestMatch
def _user(entity, role: str, name: str, institution_id=None) -> dict:
    return {
        "id": str(entity.id),
        "name": name,
        "role": role,
        "phone": entity.phone,
        "email": entity.email,
        "institutionId": str(institution_id) if institution_id else None,
        "isActive": getattr(entity, "is_active", True),
        "createdAt": entity.created_at.isoformat() if entity.created_at else "",
    }


def _institution(entity, kind: str) -> dict:
    return {
        "id": str(entity.id),
        "name": entity.name,
        "type": kind,
        "address": entity.address,
        "phone": entity.phone,
        "contactName": entity.name,
        "registrationStatus": entity.approval_status.value.capitalize(),
        "createdAt": entity.created_at.isoformat() if entity.created_at else "",
    }


def load_snapshot(db: Session) -> dict:
    hospitals = db.query(Hospital).order_by(Hospital.created_at.desc()).all()
    organizations = db.query(Organization).order_by(Organization.created_at.desc()).all()
    users = [
        _user(item, "Donor", item.full_name)
        for item in db.query(Donor).order_by(Donor.created_at.desc()).all()
    ]
    users.extend(
        _user(item, "Hospital", item.name, item.id)
        for item in hospitals
    )
    users.extend(
        _user(item, "Partner", item.name, item.id)
        for item in organizations
    )

    requests = []
    for item in db.query(BloodRequest).order_by(BloodRequest.created_at.desc()).all():
        requests.append({
            "id": str(item.id),
            "requesterId": str(item.donor_id or item.organization_id),
            "hospitalId": str(item.hospital_id) if item.hospital_id else None,
            "hospitalName": item.hospital_name_text or "Unspecified facility",
            "isHospitalRegistered": item.is_hospital_backed,
            "bloodGroup": item.blood_type_needed.value,
            "unitsRequired": item.units_needed,
            "unitsFulfilled": item.units_secured,
            "unitsRemaining": max(0, item.units_needed - item.units_secured),
            "urgency": item.urgency_level.value.capitalize(),
            "requiredBy": item.required_by.isoformat(),
            "status": {
                "pending_verification": "Pending hospital verification",
                "partially_matched": "Matched / In progress",
                "partially_matched": "Matched / In progress",
                "rejected": "Cancelled",
                "cancelled": "Cancelled",
                "expired": "Expired",
            }.get(item.status.value, item.status.value.capitalize()),
            "trustLabel": "Institution-backed" if item.is_hospital_backed else "Self-verified",
            "createdAt": item.created_at.isoformat() if item.created_at else "",
        })

    return {
        "users": users,
        "institutions": [*_institution_list(hospitals, "Hospital"), *_institution_list(organizations, "Partner")],
        "requests": requests,
        "safetyFlags": [
            {
                "id": str(item.id), "reporterId": str(item.reporter_id),
                "reportedUserId": str(item.reported_user_id),
                "requestId": str(item.request_id) if item.request_id else None,
                "category": item.category, "excerpt": item.excerpt,
                "status": item.status.capitalize(), "createdAt": item.created_at.isoformat(),
                "resolutionNote": item.resolution_note,
            }
            for item in db.query(SafetyFlag).order_by(SafetyFlag.created_at.desc()).all()
        ],
        "auditEvents": [
            {
                "id": str(item.id), "actorId": item.actor_id, "actorName": item.actor_name,
                "action": item.action, "targetType": item.target_type, "targetId": item.target_id,
                "timestamp": item.timestamp.isoformat(), "note": item.note,
            }
            for item in db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(200).all()
        ],
        "fulfillments": [
            {
                "id": str(item.id), "requestId": str(item.blood_request_id),
                "institutionId": str(item.organization_id), "staffUserId": "",
                "units": item.units_committed,
                "status": "Staff confirmed" if item.confirmed_at else "Handover recorded" if item.handover_at else "Claimed",
                "createdAt": item.accepted_at.isoformat(),
                "handoverAt": item.handover_at.isoformat() if item.handover_at else None,
                "confirmedAt": item.confirmed_at.isoformat() if item.confirmed_at else None,
            }
            for item in db.query(RequestMatch).filter(RequestMatch.organization_id.isnot(None)).order_by(RequestMatch.accepted_at.desc()).all()
        ],
    }


def _institution_list(items, kind: str) -> list[dict]:
    return [_institution(item, kind) for item in items]

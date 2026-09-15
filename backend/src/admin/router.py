from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from src.admin import controller, dtos
from src.admin.snapshot import load_snapshot
from src.admin.controller import get_current_admin
from src.hospitals.dtos import HospitalOut
from src.organizations.dtos import OrganizationOut
from src.utils.auth import Identity
from src.utils.database import get_db
from src.utils.limiter import limiter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=dtos.TokenOut)
@limiter.limit("5/minute")
def login(request: Request, data: dtos.AdminLogin):
    token = controller.login(data)
    return dtos.TokenOut(access_token=token)


@router.get("/snapshot", response_model=dict)
def snapshot(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return load_snapshot(db)


@router.get("/users", response_model=list[dtos.AdminUserOut])
def list_users(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.list_users(db)


@router.patch("/users/{user_role}/{user_id}/status", response_model=dtos.AdminUserOut)
def update_user_status(
    user_role: str,
    user_id: str,
    data: dtos.UserStatusUpdate,
    db: Session = Depends(get_db),
    _admin: Identity = Depends(get_current_admin),
):
    return controller.update_user_status(user_role, user_id, data, db)


@router.get("/safety-flags", response_model=list[dtos.SafetyFlagOut])
def list_safety_flags(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.list_safety_flags(db)


@router.patch("/safety-flags/{flag_id}", response_model=dtos.SafetyFlagOut)
def resolve_safety_flag(
    flag_id: str,
    data: dtos.SafetyFlagResolution,
    db: Session = Depends(get_db),
    admin: Identity = Depends(get_current_admin),
):
    return controller.resolve_safety_flag(flag_id, data, db, admin.id)


@router.get("/audit-events", response_model=list[dtos.AuditEventOut])
def list_audit_events(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.list_audit_events(db)


@router.get("/metrics", response_model=dtos.MetricsOut)
def get_metrics(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.metrics(db)


@router.get("/hospitals/pending", response_model=list[HospitalOut])
def list_pending_hospitals(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.list_pending_hospitals(db)


@router.patch("/hospitals/{hospital_id}/decision", response_model=HospitalOut)
def decide_hospital(
    hospital_id: str,
    decision: dtos.ApprovalDecision,
    db: Session = Depends(get_db),
    _admin: Identity = Depends(get_current_admin),
):
    return controller.decide_hospital(hospital_id, decision, db)


@router.get("/organizations/pending", response_model=list[OrganizationOut])
def list_pending_organizations(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return controller.list_pending_organizations(db)


@router.patch("/organizations/{org_id}/decision", response_model=OrganizationOut)
def decide_organization(
    org_id: str,
    decision: dtos.ApprovalDecision,
    db: Session = Depends(get_db),
    _admin: Identity = Depends(get_current_admin),
):
    return controller.decide_organization(org_id, decision, db)

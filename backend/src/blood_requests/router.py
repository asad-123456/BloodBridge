from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.admin.controller import get_current_admin
from src.blood_requests import controller, dtos
from src.blood_requests.controller import get_current_poster
from src.donors.controller import get_current_donor
from src.donors.models import Donor
from src.hospitals.controller import get_current_hospital
from src.hospitals.models import Hospital
from src.inventory.models import BloodInventory
from src.organizations.controller import get_current_organization
from src.organizations.models import Organization
from src.utils.auth import Identity, get_current_identity
from src.utils.database import get_db
from src.utils.enums import MatchStatus, RequestStatus

router = APIRouter(prefix="/blood-requests", tags=["blood_requests"])


@router.post("", response_model=dtos.BloodRequestOut, status_code=201)
def create_request(
    data: dtos.BloodRequestCreate,
    poster: Identity = Depends(get_current_poster),
    db: Session = Depends(get_db),
):
    return controller.create_request(data, db, poster)


# Specific paths are declared before /{request_id} so the intent is obvious,
# even though a single-segment param wouldn't shadow them.

@router.get("/nearby/for-me", response_model=list[dtos.NearbyBloodRequestOut])
def list_nearby_for_donor(donor: Donor = Depends(get_current_donor), db: Session = Depends(get_db)):
    return controller.list_nearby_for_donor(donor, db)


@router.get("/hospital/pending", response_model=list[dtos.BloodRequestOut])
def list_pending_for_hospital(hospital: Hospital = Depends(get_current_hospital), db: Session = Depends(get_db)):
    return controller.list_pending_for_hospital(hospital, db)


@router.post("/{request_id}/fulfill", response_model=dict)
def fulfill_request_by_partner(
    request_id: str,
    payload: dtos.FulfillRequestDTO,
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db),
):
    blood_request = controller.get_request(request_id, db)
    if blood_request.status not in (
        RequestStatus.ACTIVE,
        RequestStatus.PARTIALLY_MATCHED,
        RequestStatus.FULLY_MATCHED,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active requests can be fulfilled by partner inventory.",
        )

    stock = (
        db.query(BloodInventory)
        .filter(BloodInventory.organization_id == organization.id)
        .filter(BloodInventory.blood_group == blood_request.blood_type_needed.value)
        .filter(BloodInventory.component_type == payload.component_type)
        .first()
    )
    if not stock or stock.units_available < payload.units_to_fulfill:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient blood units in inventory.",
        )

    existing_claim = db.query(RequestMatch).filter(
        RequestMatch.blood_request_id == blood_request.id,
        RequestMatch.organization_id == organization.id,
        RequestMatch.status == MatchStatus.ACCEPTED,
    ).first()
    if existing_claim:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Your institution already has an open claim for this request.")

    stock.units_available -= payload.units_to_fulfill
    match = RequestMatch(
        blood_request_id=blood_request.id,
        organization_id=organization.id,
        units_committed=payload.units_to_fulfill,
        status=MatchStatus.ACCEPTED,
    )
    db.add(match)
    blood_request.units_secured = min(
        blood_request.units_secured + payload.units_to_fulfill,
        blood_request.units_needed,
    )
    blood_request.status = (
        RequestStatus.FULFILLED
        if blood_request.units_secured >= blood_request.units_needed
        else RequestStatus.PARTIALLY_MATCHED
    )

    db.commit()
    db.refresh(blood_request)
    db.refresh(stock)
    db.refresh(match)
    return {
        "message": f"Successfully fulfilled {payload.units_to_fulfill} unit(s).",
        "units_remaining": max(0, blood_request.units_needed - blood_request.units_secured),
        "status": blood_request.status.value,
        "fulfillment_id": str(match.id),
    }


@router.get("/{request_id}", response_model=dtos.BloodRequestOut)
def get_request(
    request_id: str,
    identity: Identity = Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    """Patient name and contact number are only returned to the poster, the
    verifying hospital, an admin, or a donor/organization this request is
    actually reaching out to. Everyone else gets a 404."""
    return controller.get_request_for_viewer(request_id, identity, db)


@router.patch("/{request_id}/hospital-verify", response_model=dtos.BloodRequestOut)
def hospital_verify(
    request_id: str,
    approve: bool,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    return controller.hospital_decide(request_id, approve, hospital, db)


@router.patch("/{request_id}/cancel", response_model=dtos.BloodRequestOut)
def cancel_request(
    request_id: str,
    data: dtos.CancelRequest,
    poster: Identity = Depends(get_current_poster),
    db: Session = Depends(get_db),
):
    return controller.cancel_request(request_id, data, db, poster)


@router.patch("/{request_id}/widen-radius", response_model=dtos.BloodRequestOut)
def widen_radius(
    request_id: str,
    data: dtos.WidenRadiusRequest,
    poster: Identity = Depends(get_current_poster),
    db: Session = Depends(get_db),
):
    return controller.widen_radius(request_id, data, db, poster)


@router.patch("/{request_id}/reactivate", response_model=dtos.BloodRequestOut)
def reactivate_request(
    request_id: str,
    poster: Identity = Depends(get_current_poster),
    db: Session = Depends(get_db),
):
    return controller.reactivate_request(request_id, db, poster)


@router.post("/hospital/close/{request_id}", response_model=dtos.BloodRequestOut)
def close_request_as_hospital(
    request_id: str,
    hospital: Hospital = Depends(get_current_hospital),
    db: Session = Depends(get_db),
):
    return controller.close_request(request_id, db, hospital=hospital)


@router.post("/poster/close/{request_id}", response_model=dtos.BloodRequestOut)
def close_request_as_poster(
    request_id: str,
    poster: Identity = Depends(get_current_poster),
    db: Session = Depends(get_db),
):
    return controller.close_request(request_id, db, identity=poster)


# --- Sweeps. Manual for now; point a scheduler at these in Phase 2. --------

@router.post("/admin/expire-overdue")
def expire_overdue(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return {"expired_count": controller.expire_overdue_requests(db)}


@router.post("/admin/auto-widen")
def auto_widen(db: Session = Depends(get_db), _admin: Identity = Depends(get_current_admin)):
    return {"widened_count": controller.auto_widen_stale_requests(db)}

import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)
from sqlalchemy.orm import Session

from src.chat import controller, dtos
from src.utils.auth import Identity, get_current_identity
from src.utils.database import get_db
from src.utils.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])




@router.get("/{match_id}/messages", response_model=list[dtos.ChatMessageOut])
def get_messages(
    match_id: str,
    identity: Identity = Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    return controller.list_messages(match_id, identity, db)


@router.post("/{match_id}/messages", response_model=dtos.ChatMessageOut, status_code=201)
@limiter.limit("60/minute")
def send_message(
    request: Request,
    match_id: str,
    data: dtos.ChatMessageIn,
    identity: Identity = Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    return controller.send_message(match_id, identity, data, db)



@router.post("/{match_id}/report", status_code=201)
@limiter.limit("5/minute")
def report_chat(
    request: Request,
    match_id: str,
    data: dtos.ChatReportIn,
    identity: Identity = Depends(get_current_identity),
    db: Session = Depends(get_db),
):
    return controller.report_chat(match_id, identity, data, db)


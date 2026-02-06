from fastapi import APIRouter, Depends, HTTPException
from models import Vehicle, User, Reservation
from dependencies.auth import require_role
from sqlalchemy.orm import Session
from database import get_db
from schema.reservations import ReservationListResponse, SingleReservationResponse

router = APIRouter(prefix="/reservations", tags=["Reservations management"])


@router.get("", response_model=ReservationListResponse)
def get_all_reservations(db: Session = Depends(get_db), current_user: User = Depends(require_role("admin", "manager", "user"))):

    if current_user.role in ("admin", "manager"):
        reservations = db.query(Reservation).all()
    else:
        reservations = db.query(Reservation).filter(Reservation.user_id == current_user.id).all()

    return {
        "status": "ok",
        "data": reservations
    }


@router.get("/{reservation_id}", response_model=SingleReservationResponse)
def get_reservation_by_id(reservation_id: int,
                          db: Session = Depends(get_db),
                          current_user: User = Depends(require_role("admin", "user"))):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail=f"There is no reservation with id: {reservation_id}")

    if current_user.role.name != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="User does not have permission to view other user data"
        )

    return {
        "status": "success",
        "data": reservation
    }
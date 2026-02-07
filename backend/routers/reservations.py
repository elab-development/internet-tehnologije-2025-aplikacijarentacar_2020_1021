from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from models import Vehicle, User, Reservation
from dependencies.auth import require_role
from sqlalchemy import exists
from sqlalchemy.orm import Session
from database import get_db
from schema.reservations import ReservationListResponse, SingleReservationResponse, ReservationCreate, ReservationStatusUpdate

router = APIRouter(prefix="/reservations", tags=["Reservations management"])


@router.get("", response_model=ReservationListResponse)
def get_all_reservations(db: Session = Depends(get_db), current_user: User = Depends(require_role("admin", "manager", "customer"))):

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
                          current_user: User = Depends(require_role("admin", "manager", "customer"))):
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


@router.post("", response_model=SingleReservationResponse)
def create_reservation(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "customer"))
):

    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle with id: {payload.vehicle_id} is not found")

    if check_reservation_overlap(payload.vehicle_id, payload.start_date, payload.end_date, db):
        raise HTTPException(
            status_code=403,
            detail=f"Vehicle with id: {payload.vehicle_id} is already booked for selected period"
        )

    total_days = (payload.end_date - payload.start_date).days
    if total_days <= 0:
        total_days = 1
    total_price = total_days * vehicle.price_per_day

    new_res = Reservation(
        user_id=current_user.id,
        vehicle_id=payload.vehicle_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        price=total_price,
        status="confirmed",
        total_days=total_days
    )

    db.add(new_res)
    db.commit()
    db.refresh(new_res)

    return {
        "status": "success",
        "data": new_res
    }


@router.put("/{reservation_id}", response_model=SingleReservationResponse)
def update_reservation(
    reservation_id: int,
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "customer"))
):

    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail=f"Reservation with id: {id} is not found")

    if current_user.role.name != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this reservation")

    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle with id: {id} is not found")

    if check_reservation_overlap(payload.vehicle_id, payload.start_date, payload.end_date, db, exclude_id=reservation_id):
        raise HTTPException(
            status_code=400,
            detail=f"We could not fulfill your reservation update as vehicle with id: {payload.vehicle_id} is already booked for chosen period"
        )

    total_days = (payload.end_date - payload.start_date).days
    if total_days <= 0:
        total_days = 1
    total_price = total_days * vehicle.price_per_day

    reservation.vehicle_id = payload.vehicle_id
    reservation.start_date = payload.start_date
    reservation.end_date = payload.end_date
    reservation.price = total_price
    reservation.total_days = total_days
    reservation.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(reservation)

    return {
        "status": "success",
        "data": reservation
    }


@router.put("/{reservation_id}/status")
def update_reservation_status(
        reservation_id: int,
        payload: ReservationStatusUpdate,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role("admin", "manager", "customer"))
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=404, detail=f"Reservation with id: {id} is not found"
        )

    if current_user.role.name != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to perform actions on this reservation")

    if current_user.role_name == "customer" and payload.status != "cancelled":
        raise HTTPException(status_code=403, detail="Not authorized to perform that status change")

    reservation.status = payload.status
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return {
        "status": "success",
        "message": "Successfully updated reservation status"
    }


@router.delete("/{reservation_id}")
def delete_reservation(
        reservation_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role("admin"))
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(
            status_code=404, detail=f"Reservation with id: {id} is not found"
        )

    db.delete(reservation)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully deleted reservation with id: {reservation_id}"
    }


def check_reservation_overlap(vehicle_id: int, start_date: datetime, end_date: datetime, db: Session,
                              exclude_id: int = None):
    filters = [
        Reservation.vehicle_id == vehicle_id,
        Reservation.start_date < end_date,
        Reservation.end_date > start_date,
        Reservation.status != "cancelled"
    ]

    """
    If action is to update the reservation, we will have exclude_id provided
    """
    if exclude_id:
        filters.append(Reservation.id != exclude_id)

    overlap = db.query(Reservation).filter(*filters).first()

    "Returns true if the reservation overlaps with another reservation"
    return overlap is not None
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Reservation, Review
from dependencies.auth import require_role
from schema.review import ReviewResponse, ReviewCreate, ReviewResponseList

router = APIRouter(prefix="/reviews", tags=["Reviews management"])


@router.post("", response_model=ReviewResponse)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer"))
):
    reservation = db.query(Reservation).filter(
        Reservation.id == payload.reservation_id,
        Reservation.user_id == current_user.id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail=f"Reservation with id {payload.reservation_id} not found"
        )

    if reservation.status != "completed":
        raise HTTPException(
            status_code=403,
            detail="You can only review completed reservations"
        )

    existing_review = db.query(Review).filter(
        Review.reservation_id == payload.reservation_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="Review already exists for this reservation"
        )

    new_review = Review(
        user_id=current_user.id,
        vehicle_id=reservation.vehicle_id,
        reservation_id=payload.reservation_id,
        rating=payload.rating,
        comment=payload.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "status": "Review successfully created",
        "data": new_review
    }


@router.get("", response_model=ReviewResponseList)
def get_all_reviews(
    db: Session = Depends(get_db),
):
    reviews = db.query(Review).all()
    return {
        "status": "ok",
        "data": reviews
    }


@router.get("/vehicle/{vehicle_id}", response_model=ReviewResponseList)
def get_reviews_by_vehicle(
        vehicle_id: str,
        db: Session = Depends(get_db),
):
    reviews = db.query(Review).filter(Review.vehicle_id == vehicle_id).all()

    return {
        "status": "ok",
        "data": reviews
    }



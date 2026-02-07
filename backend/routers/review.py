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
    current_user: User = Depends(require_role("admin"))
):
    has_reservation = db.query(Reservation).filter(
        Reservation.user_id == current_user.id,
        Reservation.vehicle_id == payload.vehicle_id,
        Reservation.status == "completed"
    ).first()

    if not has_reservation:
        raise HTTPException(
            status_code=403,
            detail=f"You can only review vehicles you had the reservation for"
        )

    new_review = Review(
        user_id=current_user.id,
        vehicle_id=payload.vehicle_id,
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



from datetime import timedelta, datetime
from typing import List
from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Reservation, Review, Vehicle
from dependencies.auth import require_role
from schema.user import UserResponseAdminPanel

router = APIRouter(prefix="/admin", tags=["Admin endpoints"])


@router.get("/users", response_model=List[UserResponseAdminPanel])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(User).all()


@router.delete("/users/{user_id}", status_code=200)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User with id: {user_id} does not exist")
    db.delete(user)
    db.commit()
    return {
        "status": "success",
        "message": "User successfully deleted"
    }


@router.get("/stats", summary="Admin dashboard stats")
def get_admin_stats(
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role("admin"))
):
    now = datetime.now()

    """Help function to get count of reservations within timeframe"""
    def count_reservations(start_limit=None):
        query = db.query(Reservation)
        if start_limit:
            query = query.filter(Reservation.created_at >= start_limit)
        return query.count()

    """Help function to get count of new users within timeframe"""
    def count_users(start_limit=None):
        query = db.query(User)
        if start_limit:
            query = query.filter(User.created_at >= start_limit)
        return query.count()

    """Help function to get sum of revenue for reservations within timeframe"""
    def sum_revenue(start_limit=None):
        query = db.query(func.sum(Reservation.price)).filter(Reservation.status != 'cancelled')
        if start_limit:
            query = query.filter(Reservation.created_at >= start_limit)

        result = query.scalar()
        return float(result) if result else 0.0

    counters = {
        "reservations": {
            "all_time": count_reservations(),
            "last_30_days": count_reservations(now - timedelta(days=30)),
            "last_7_days": count_reservations(now - timedelta(days=7)),
            "today": count_reservations(now.replace(hour=0, minute=0, second=0, microsecond=0))
        },
        "users": {
            "all_time": count_users(),
            "last_30_days": count_users(now - timedelta(days=30)),
            "last_7_days": count_users(now - timedelta(days=7)),
            "today": count_users(now.replace(hour=0, minute=0, second=0, microsecond=0))
        },
        "revenue": {
            "total_all_time": sum_revenue(),
            "last_30_days": sum_revenue(now - timedelta(days=30)),
            "last_7_days": sum_revenue(now - timedelta(days=7)),
            "today": sum_revenue(now.replace(hour=0, minute=0, second=0, microsecond=0))
        },
        "total_vehicles": db.query(Vehicle).count()
    }

    """Get revenue by month"""
    revenue_by_month = db.query(
        func.to_char(Reservation.created_at, 'YYYY-MM').label('month'),
        func.sum(Reservation.price).label('revenue')
    ).filter(Reservation.status != 'cancelled').group_by('month').all()

    """Get top 5 popular vehicles"""
    popular_vehicles = db.query(
        Vehicle.brand,
        Vehicle.model,
        func.count(Reservation.id).label('count')
    ).join(Reservation).group_by(Vehicle.id).order_by(func.count(Reservation.id).desc()).limit(5).all()

    return {
        "status": "ok",
        "data": {
            "counters": counters,
            "charts": {
                "revenue_history": [{"month": r.month, "revenue": float(r.revenue)} for r in revenue_by_month],
                "top_vehicles": [{"name": f"{v.brand} {v.model}", "rentals": v.count} for v in popular_vehicles]
            }
        }
    }


@router.put("/vehicles/{vehicle_id}/status")
def toggle_vehicle_availability(
        vehicle_id: int,
        is_available: bool,
        db: Session = Depends(get_db),
        current_user: User = Depends(require_role("admin"))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle with id: {vehicle_id} is not found")

    vehicle.available = is_available
    db.commit()
    return {"status": "ok", "message": f"Status of a vehicle with id: {vehicle_id} has been successfully updated"}
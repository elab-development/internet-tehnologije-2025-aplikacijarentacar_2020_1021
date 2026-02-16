
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from models import Vehicle, User
from dependencies.auth import require_role
from sqlalchemy.orm import Session
from database import get_db
from schema.vehicle import VehicleListResponse, VehicleCreate, VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicle management"])


@router.get("", response_model=VehicleListResponse)
def get_vehicles(db: Session = Depends(get_db)):
    return {
        "status": "ok",
        "data": db.query(Vehicle).all()
    }


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"There is no vehicle with id: {id}")
    return vehicle


@router.delete("/vehicles/{id}")
def delete_vehicle(
    id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Vehicle with id: {id} not found")
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle with id: {id} deleted".format(id=id)}


@router.put("/vehicles/{id}/status")
def update_status(
    id: int,
    new_status: bool,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == id).first()
    current_status = vehicle.status
    vehicle.available = new_status
    db.commit()
    db.refresh(vehicle)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return {"message": f"Status successfully updated from {current_status} to {vehicle.status} for id: {id}"}


@router.post("")
def add_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin"))
):
    new_vehicle = Vehicle(**vehicle_data.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return {
        "status": "ok",
        "data": new_vehicle
    }

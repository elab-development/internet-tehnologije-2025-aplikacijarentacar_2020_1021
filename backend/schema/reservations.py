from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import List
from pydantic import BaseModel
from enum import Enum


class ReservationStatusEnum(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    PAYMENT_PROCESSED = "payment_processed"


class UserInReservation(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class VehicleInReservation(BaseModel):
    id: int
    brand: str
    model: str
    price_per_day: float

    class Config:
        from_attributes = True


class ReservationResponse(BaseModel):
    id: int
    start_date: datetime
    end_date: datetime
    price: float
    status: str
    user: UserInReservation
    vehicle: VehicleInReservation

    class Config:
        from_attributes = True


class SingleReservationResponse(BaseModel):
    status: str
    data: ReservationResponse

    class Config:
        from_attributes = True


class ReservationListResponse(BaseModel):
    status: str
    data: List[ReservationResponse]

    class Config:
        from_attributes = True


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatusEnum


class ReservationCreate(BaseModel):
    vehicle_id: int
    start_date: datetime
    end_date: datetime

    """
    @:param
    vehicle_id: int - id of a vehicle reservation supposed to be for
    start_date: datetime - start date of reservation
    end_date: datetime - end date of reservation
    
    Validates if start and end dates are in valid format (start date can't be before today's date, end date can't be before start)
    """
    @field_validator('start_date')
    def start_date_must_be_future(cls, v):
        if v.date() < datetime.now().date():
            raise ValueError('Start date can not be in the past')
        return v

    @field_validator('end_date')
    def end_date_must_be_after_start(cls, v, info):
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('End date has to be after the start date')
        return v
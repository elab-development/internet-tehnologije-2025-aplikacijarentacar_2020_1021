from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import List
from pydantic import BaseModel


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
    #total_price: float
    #status: str
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


class ReservationCreate(BaseModel):
    vehicle_id: int
    start_date: datetime
    end_date: datetime

    @field_validator('end_date')
    @classmethod
    def check_dates(cls, v: datetime, info):
        if 'start_date' in info.data and v <= info.data['start_date']:
            raise ValueError('Datum završetka mora biti nakon datuma početka')
        if v < datetime.now():
            raise ValueError('Ne možete rezervisati u prošlosti')
        return v
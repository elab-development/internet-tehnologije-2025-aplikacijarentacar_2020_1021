from typing import List
from pydantic import BaseModel


class VehicleResponse(BaseModel):
    id: int
    brand: str
    model: str
    price_per_day: float
    available: bool

    class Config:
        from_attributes = True


class VehicleListResponse(BaseModel):
    status: str
    data: List[VehicleResponse]

    class Config:
        from_attributes = True


class VehicleCreate(BaseModel):
    brand: str
    model: str
    price_per_day: float
    available: bool

    class Config:
        from_attributes = True


from typing import List

from pydantic import BaseModel


class UserInReview(BaseModel):
    full_name: str

    class Config:
        from_attributes = True


class VehicleInReview(BaseModel):
    id: int
    brand: str
    model: str

    class Config:
        from_attributes = True


class ReviewResponseData(BaseModel):
    id: int
    rating: int
    comment: str
    user: UserInReview
    vehicle: VehicleInReview

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    status: str
    data: ReviewResponseData

    class Config:
        from_attributes = True


class ReviewResponseList(BaseModel):
    status: str
    data: List[ReviewResponseData]

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    vehicle_id: int
    rating: int
    comment: str
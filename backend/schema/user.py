from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str
    full_name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class RoleResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    role: RoleResponse
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    token_type: str = "bearer"
    access_token: str



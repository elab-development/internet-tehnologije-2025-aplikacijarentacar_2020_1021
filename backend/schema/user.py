from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    phone_number: str


class UserCreate(UserBase):
    full_name: str
    phone_number: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
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


class UserResponseAdminPanel(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    role: RoleResponse
    is_active: bool



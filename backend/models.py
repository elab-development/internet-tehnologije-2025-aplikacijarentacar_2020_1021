from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Numeric
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    reservations = relationship("Reservation", back_populates="user")
    documents = relationship("Document", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String)
    model = Column(String)
    price_per_day = Column(Numeric(10, 2))
    available = Column(Boolean, default=True)

    reservations = relationship("Reservation", back_populates="vehicle")
    reviews = relationship("Review", back_populates="vehicle")


class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String)
    price = Column(Numeric(10, 2))
    total_days = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    non_existing_user = Column(Boolean, default=False)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    user = relationship("User", back_populates="reservations")
    vehicle = relationship("Vehicle", back_populates="reservations")


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_type = Column(String)
    file_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    rating = Column(Integer)
    comment = Column(String(500))

    user = relationship("User", back_populates="reviews")
    vehicle = relationship("Vehicle", back_populates="reviews")
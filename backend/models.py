from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Numeric
from sqlalchemy.orm import relationship
from database import Base
import datetime


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.id"))

    reservations = relationship("Reservation", back_populates="user")
    documents = relationship("Document", back_populates="user")


class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String)
    model = Column(String)
    price_per_day = Column(Numeric(10, 2))
    available = Column(Boolean, default=True)


class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    user = relationship("User", back_populates="reservations")


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)

    user = relationship("User", back_populates="documents")
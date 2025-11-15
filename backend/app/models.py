from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("FoodListing", back_populates="donor")
    claims = relationship("Claim", back_populates="recipient")
    volunteer_tasks = relationship("PickupTask", back_populates="volunteer")


class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    location = Column(String, nullable=False)
    pickup_deadline = Column(DateTime, nullable=False)
    status = Column(String, default="available", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    donor = relationship("User", back_populates="listings")
    claim = relationship("Claim", back_populates="listing", uselist=False)
    pickup_tasks = relationship("PickupTask", back_populates="listing")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id"), unique=True, nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("FoodListing", back_populates="claim")
    recipient = relationship("User", back_populates="claims")


class PickupTask(Base):
    __tablename__ = "pickup_tasks"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("food_listings.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("FoodListing", back_populates="pickup_tasks")
    volunteer = relationship("User", back_populates="volunteer_tasks")

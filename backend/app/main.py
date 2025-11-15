from datetime import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from . import models
from .database import Base, engine, get_db

app = FastAPI(title="Sustainable Food Waste Reduction API")

Base.metadata.create_all(bind=engine)

ROLE_CHOICES = {"Donor", "Recipient", "Volunteer", "Admin"}
LISTING_STATUSES = {"available", "claimed", "completed", "expired"}


class SignupRequest(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str

    def validate_role(self) -> str:
        if self.role not in ROLE_CHOICES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role must be one of: {', '.join(sorted(ROLE_CHOICES))}",
            )
        return self.role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ListingCreateRequest(BaseModel):
    donor_id: int
    title: str = Field(..., max_length=255)
    description: Optional[str]
    quantity: float = Field(..., gt=0)
    unit: str = Field(..., max_length=50)
    location: str = Field(..., max_length=255)
    pickup_deadline: datetime


class ClaimRequest(BaseModel):
    recipient_id: int


class PickupTaskRequest(BaseModel):
    listing_id: int
    volunteer_id: int
    scheduled_time: datetime


class ListingResponse(BaseModel):
    id: int
    donor_id: int
    title: str
    description: Optional[str]
    quantity: float
    unit: str
    location: str
    pickup_deadline: datetime
    status: str
    created_at: datetime
    donor_name: Optional[str]
    claimed_by: Optional[str]

    class Config:
        orm_mode = True


def hash_password(password: str) -> str:
    import hashlib

    return hashlib.sha256(password.encode()).hexdigest()


def serialize_listing(listing: models.FoodListing) -> ListingResponse:
    claim = listing.claim
    return ListingResponse(
        id=listing.id,
        donor_id=listing.donor_id,
        title=listing.title,
        description=listing.description,
        quantity=listing.quantity,
        unit=listing.unit,
        location=listing.location,
        pickup_deadline=listing.pickup_deadline,
        status=listing.status,
        created_at=listing.created_at,
        donor_name=listing.donor.name if listing.donor else None,
        claimed_by=claim.recipient.name if claim and claim.recipient else None,
    )


@app.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    data.validate_role()
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = models.User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully", "user_id": user.id}


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or user.password != hash_password(data.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@app.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(data: ListingCreateRequest, db: Session = Depends(get_db)):
    donor = db.get(models.User, data.donor_id)
    if not donor or donor.role not in {"Donor", "Admin"}:
        raise HTTPException(status_code=400, detail="Listing can only be created by donors or admins")

    listing = models.FoodListing(
        donor_id=donor.id,
        title=data.title,
        description=data.description,
        quantity=data.quantity,
        unit=data.unit,
        location=data.location,
        pickup_deadline=data.pickup_deadline,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return serialize_listing(listing)


@app.get("/listings", response_model=List[ListingResponse])
def list_listings(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.FoodListing).order_by(models.FoodListing.pickup_deadline)
    if status_filter:
        if status_filter not in LISTING_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status filter")
        query = query.filter(models.FoodListing.status == status_filter)
    listings = query.all()
    return [serialize_listing(listing) for listing in listings]


@app.post("/listings/{listing_id}/claim")
def claim_listing(listing_id: int, data: ClaimRequest, db: Session = Depends(get_db)):
    listing = db.get(models.FoodListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "available":
        raise HTTPException(status_code=400, detail="Listing is not available for claiming")

    recipient = db.get(models.User, data.recipient_id)
    if not recipient or recipient.role not in {"Recipient", "Admin"}:
        raise HTTPException(status_code=400, detail="Only recipients can claim listings")

    claim = models.Claim(listing_id=listing.id, recipient_id=recipient.id, status="scheduled")
    listing.status = "claimed"

    db.add(claim)
    db.commit()
    db.refresh(listing)
    db.refresh(claim)

    return {
        "message": "Listing claimed successfully",
        "listing": serialize_listing(listing),
        "claim_id": claim.id,
    }


@app.post("/logistics/tasks")
def create_pickup_task(data: PickupTaskRequest, db: Session = Depends(get_db)):
    listing = db.get(models.FoodListing, data.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    volunteer = db.get(models.User, data.volunteer_id)
    if not volunteer or volunteer.role not in {"Volunteer", "Admin"}:
        raise HTTPException(status_code=400, detail="Only volunteers can be assigned to pickup tasks")

    task = models.PickupTask(
        listing_id=listing.id,
        volunteer_id=volunteer.id,
        scheduled_time=data.scheduled_time,
    )
    listing.status = "claimed"

    db.add(task)
    db.commit()
    db.refresh(task)
    db.refresh(listing)

    return {
        "message": "Pickup task scheduled",
        "task": {
            "id": task.id,
            "listing_id": task.listing_id,
            "volunteer_id": task.volunteer_id,
            "scheduled_time": task.scheduled_time,
            "completed": task.completed,
        },
    }


@app.post("/logistics/tasks/{task_id}/complete")
def complete_pickup_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.PickupTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Pickup task not found")

    task.completed = True
    if task.listing:
        task.listing.status = "completed"

    db.commit()
    db.refresh(task)

    return {"message": "Pickup task marked as completed"}


@app.get("/analytics/impact")
def impact_summary(db: Session = Depends(get_db)):
    total_listings = db.query(models.FoodListing).count()
    total_claimed = db.query(models.FoodListing).filter(models.FoodListing.status == "claimed").count()
    total_completed = db.query(models.FoodListing).filter(models.FoodListing.status == "completed").count()
    total_available = db.query(models.FoodListing).filter(models.FoodListing.status == "available").count()

    quantity_diverted = (
        db.query(models.FoodListing)
        .filter(models.FoodListing.status.in_(["claimed", "completed"]))
        .with_entities(models.FoodListing.quantity)
        .all()
    )
    total_quantity = sum(row[0] for row in quantity_diverted)

    unique_donors = db.query(models.FoodListing.donor_id).distinct().count()
    unique_recipients = db.query(models.Claim.recipient_id).distinct().count()

    return {
        "totals": {
            "listings": total_listings,
            "available": total_available,
            "claimed": total_claimed,
            "completed": total_completed,
        },
        "impact": {
            "quantity_diverted": total_quantity,
            "unique_donors": unique_donors,
            "unique_recipients": unique_recipients,
        },
    }

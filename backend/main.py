from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from typing import List

from database import create_db_and_tables, get_session
from models import Item, ItemCreate, ItemRead, WorkerProfile, PolicyCreate, ClaimApprove
from database.crud import save_worker, create_policy, get_active_policies, approve_claim

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block runs on startup
    print("Starting up... creating database tables if they don't exist.")
    create_db_and_tables()
    yield
    # This block runs on shutdown
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

@app.post("/items/", response_model=ItemRead)
def create_item(*, session: Session = Depends(get_session), item: ItemCreate):
    """
    Create a new item in the database.
    """
    db_item = Item.model_validate(item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

@app.get("/items/", response_model=List[ItemRead])
def read_items(session: Session = Depends(get_session)):
    """
    Read all items from the database.
    """
    items = session.exec(select(Item)).all()
    return items

@app.get("/")
def root():
    return {"message": "Welcome to the FastAPI Backend connected to Supabase!"}

# --- Supabase Endpoints ---

@app.post("/workers/")
def new_worker(profile: WorkerProfile):
    """Save a new worker profile."""
    response = save_worker(profile.model_dump())
    return response

@app.post("/policies/")
def new_policy(policy_data: PolicyCreate):
    """Create a new policy for a worker."""
    response = create_policy(
        worker_id=policy_data.worker_id, 
        premium=policy_data.premium, 
        coverage=policy_data.coverage
    )
    return response

@app.get("/policies/{zone}")
def list_active_policies(zone: str):
    """Read all active policies for a specific zone."""
    response = get_active_policies(zone)
    return response

@app.put("/claims/{claim_id}/approve")
def approve_worker_claim(claim_id: str, claim_data: ClaimApprove):
    """Update a claim status to approved after fraud check."""
    response = approve_claim(claim_id, claim_data.payout_amount)
    return response

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

from database import create_db_and_tables, get_session
from models import Item, ItemCreate, ItemRead, WorkerProfile, PolicyCreate, ClaimApprove
from database.crud import save_worker, create_policy, get_active_policies, approve_claim

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This block runs on startup
    print("Starting up... bypassing table creation.")
    # create_db_and_tables()
    yield
    # This block runs on shutdown
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    # ... logic for approve_claim ...
    # Assuming approve_claim is imported and works
    from database.crud import approve_claim
    response = approve_claim(claim_id, claim_data.payout_amount)
    return response

@app.get("/aqi/{city}")
async def get_city_aqi(city: str):
    """Proxy for OpenAQ API to avoid CORS issues."""
    api_key = os.getenv("VITE_WAQI_TOKEN") # Using the same key name
    # Restrict to India (iso=IN) for Chennai searches
    url = f"https://api.openaq.org/v3/locations?name={city}&iso=IN"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers={"X-API-Key": api_key}, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e), "results": []}

if __name__ == "__main__":
    import uvicorn
    # Vercel and other cloud providers set the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

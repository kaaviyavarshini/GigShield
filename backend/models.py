from typing import Optional
from sqlmodel import Field, SQLModel

# Base model containing the shared fields
class ItemBase(SQLModel):
    name: str
    description: Optional[str] = None
    price: float

# The main model that represents the table in the database
class Item(ItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

# Model used when creating a new Item (same fields as Base)
class ItemCreate(ItemBase):
    pass

# Model used when returning an Item (includes the id)
class ItemRead(ItemBase):
    id: int

# --- Supabase API Models ---
from pydantic import BaseModel

class WorkerProfile(BaseModel):
    name: str
    work_type: Optional[str] = None
    platform: str
    id_card_url: Optional[str] = None
    zone: str
    weekly_earnings: float
    plan_type: Optional[str] = "None"

class PolicyCreate(BaseModel):
    worker_id: str
    premium: float
    coverage: float

class ClaimApprove(BaseModel):
    payout_amount: float

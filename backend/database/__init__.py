from sqlmodel import create_engine, SQLModel, Session
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# The database connection string from Supabase
# Go to your Supabase Project Settings -> Database -> Connection string -> URI
DATABASE_URL = os.environ.get("DATABASE_URL")

# Make sure to replace postgres:// with postgresql:// if needed by SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    # Fallback to sqlite if no DATABASE_URL is provided
    DATABASE_URL = "sqlite:///./database.db"

# Create the SQLAlchemy engine
print(f"DEBUG: Using DATABASE_URL: {DATABASE_URL}")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create all tables in the database"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Provide a transactional scope around a series of operations."""
    with Session(engine) as session:
        yield session
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str
    password: str

class Application(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    company: str
    position: str
    status: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    salary: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    user_id: Optional[uuid.UUID] = Field(default=None)


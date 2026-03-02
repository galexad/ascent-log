import os
from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine, select

# Load environment variables from .env file
# This will search the current folder and then the parent folder
load_dotenv(dotenv_path="../.env")
load_dotenv() 

postgresql_url = os.getenv("DATABASE_URL")
engine = create_engine(postgresql_url)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
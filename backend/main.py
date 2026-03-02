from contextlib import asynccontextmanager
from fastapi import FastAPI 
from routers import users, applications, auth
from database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Register the routers
app.include_router(auth.router)     
app.include_router(users.router)
app.include_router(applications.router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

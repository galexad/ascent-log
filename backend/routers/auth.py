import uuid
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel
from models import User
from database import get_session
from auth_utils import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(user_data: UserRegister, response: Response, session: Session = Depends(get_session)):
    # Check if user exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail={"error": "Email already registered"})
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    token = create_access_token(data={"sub": str(new_user.id)})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")
    
    return {"user": {"id": str(new_user.id), "email": new_user.email, "name": new_user.name}}

@router.post("/login")
async def login(credentials: UserLogin, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail={"error": "Invalid email or password"})
    
    token = create_access_token(data={"sub": str(user.id)})
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")
    
    return {"user": {"id": str(user.id), "email": user.email, "name": user.name}}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}

@router.get("/me")
async def get_me(request: Request, session: Session = Depends(get_session)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("sub")
    user = session.get(User, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {"user": {"id": str(user.id), "email": user.email, "name": user.name}}

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import User
from database import get_session

router = APIRouter()


@router.get("/api/users", response_model=List(User))
async def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users
    
@router.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/api/users", response_model=User)
async def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
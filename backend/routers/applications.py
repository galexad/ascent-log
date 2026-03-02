
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models import Application
from database import get_session

router = APIRouter()


@router.get("/api/applications", response_model=List[Application])
async def get_applications(session: Session = Depends(get_session)):
    applications = session.exec(select(Application)).all()
    return applications

@router.put("/api/applications/{application_id}", response_model=Application)
async def update_application(
    application_id: uuid.UUID, 
    application: Application, 
    session: Session = Depends(get_session)
):
    db_app = session.get(Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_data = application.model_dump(exclude_unset=True)
    for key, value in app_data.items():
        setattr(db_app, key, value)
    
    session.add(db_app)
    session.commit()
    session.refresh(db_app)
    return db_app

@router.post("/api/applications", response_model=Application)
async def create_application(application: Application, session: Session = Depends(get_session)):
    session.add(application)
    session.commit()
    session.refresh(application)
    return application

@router.delete("/api/applications/{application_id}")
async def delete_application(application_id: uuid.UUID, session: Session = Depends(get_session)):
    db_app = session.get(Application, application_id)
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    session.delete(db_app)
    session.commit()
    return {"ok": True}
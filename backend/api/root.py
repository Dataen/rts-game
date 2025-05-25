from fastapi import APIRouter

router = APIRouter()

@router.get("/api")
def root():
    return {"message": "API is running <3"}
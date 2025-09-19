from fastapi import APIRouter

router = APIRouter(prefix="/extras", tags=["Extras"])

@router.get("/")
def get_extras():
    return [
        {"name": "Extra Rice", "price": 20},
        {"name": "Egg", "price": 15}
    ]

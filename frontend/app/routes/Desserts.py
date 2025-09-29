from fastapi import APIRouter

router = APIRouter(prefix="/desserts", tags=["Desserts"])

@router.get("/")
def get_desserts():
    return [
        {"name": "Chocolate Cake", "price": 90},
        {"name": "Mango Float", "price": 80}
    ]

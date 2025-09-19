from fastapi import APIRouter

router = APIRouter(prefix="/beverages", tags=["Beverages"])

@router.get("/")
def get_beverages():
    return [
        {"name": "Iced Tea", "price": 50},
        {"name": "Coke", "price": 45}
    ]

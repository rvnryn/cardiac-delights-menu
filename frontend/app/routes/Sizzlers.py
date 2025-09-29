from fastapi import APIRouter

router = APIRouter(prefix="/sizzlers", tags=["Sizzlers"])

@router.get("/")
def get_sizzlers():
    return [
        {"name": "Beef Sizzler", "price": 200},
        {"name": "Chicken Sizzler", "price": 180}
    ]

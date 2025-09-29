from fastapi import APIRouter

router = APIRouter(prefix="/rice-toppings", tags=["Rice Toppings"])

@router.get("/")
def get_rice_toppings():
    return [
        {"name": "Beef Tapa Rice", "price": 120},
        {"name": "Pork Adobo Rice", "price": 110},
        {"name": "Chicken Teriyaki Rice", "price": 115}
    ]

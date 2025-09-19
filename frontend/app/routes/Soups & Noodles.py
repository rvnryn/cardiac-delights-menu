from fastapi import APIRouter

router = APIRouter(prefix="/soups-noodles", tags=["Soups & Noodles"])

@router.get("/")
def get_soups_noodles():
    return [
        {"name": "Chicken Noodle Soup", "price": 120},
        {"name": "Beef Ramen", "price": 150}
    ]

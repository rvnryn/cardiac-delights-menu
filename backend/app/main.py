from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .supabase import supabase
from fastapi import Query, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cardiac-delights-menu.vercel.app",
        "http://localhost:3000",
    ],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


# Optional: A simple health check route (you can remove or modify this)
@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/menu")
async def get_menu(
    category: Optional[str] = Query(None),
    inStockOnly: Optional[bool] = Query(False),
    fields: Optional[str] = Query(None),
):
    # Determine which fields to select
    select_fields = "*"
    if fields:
        # Validate and sanitize fields parameter
        valid_fields = {
            "menu_id",
            "dish_name",
            "price",
            "image_url",
            "description",
            "category",
            "stock_status",
            "created_at",
            "updated_at",
        }
        requested_fields = [f.strip() for f in fields.split(",")]
        filtered_fields = [f for f in requested_fields if f in valid_fields]
        if filtered_fields:
            select_fields = ",".join(filtered_fields)

    query = supabase.table("menu").select(select_fields)
    if category:
        query = query.eq("category", category)
    if inStockOnly:
        query = query.neq("stock_status", "out_of_stock")
    query = query.order("category", desc=False).order("dish_name", desc=False)
    res = query.execute()
    headers = {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600"
    }  # Longer cache
    return JSONResponse(content=res.data, headers=headers)


@app.get("/api/menu/{menu_id}")
async def get_menu_item(menu_id: int):
    res = supabase.table("menu").select("*").eq("menu_id", menu_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Menu item not found")
    headers = {"Cache-Control": "s-maxage=60, stale-while-revalidate=300"}
    return JSONResponse(content=res.data, headers=headers)

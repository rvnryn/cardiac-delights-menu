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
        "https://cardiac-delights-menu-17tg.vercel.app",
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


# API: GET /api/menu
@app.get("/api/menu")
async def get_menu(
    category: Optional[str] = Query(None), inStockOnly: Optional[bool] = Query(False)
):
    query = supabase.table("menu").select("*")
    if category:
        query = query.eq("category", category)
    if inStockOnly:
        query = query.neq("stock_status", "out_of_stock")
    query = query.order("category", desc=False).order("dish_name", desc=False)
    res = query.execute()
    headers = {"Cache-Control": "s-maxage=60, stale-while-revalidate=300"}
    return JSONResponse(content=res.data, headers=headers)


# API: GET /api/menu/{menu_id}
@app.get("/api/menu/{menu_id}")
async def get_menu_item(menu_id: int):
    res = supabase.table("menu").select("*").eq("menu_id", menu_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Menu item not found")
    headers = {"Cache-Control": "s-maxage=60, stale-while-revalidate=300"}
    return JSONResponse(content=res.data, headers=headers)

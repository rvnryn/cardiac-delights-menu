from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.coder import JsonCoder
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.decorator import cache
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from .supabase import supabase

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "https://cardiac-delights-menu.vercel.app",
        "http://localhost:3000",
        "http://localhost:3004",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize FastAPICache on startup
@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

# Pydantic model for menu_ingredients

class MenuIngredient(BaseModel):
    menu_id: Optional[int]
    ingredient_id: int
    quantity: Optional[float]
    ingredient_name: Optional[str]

@app.get("/api/menu/sales")
@cache(expire=300)
async def get_menu_sales():
    try:
        # Try using RPC function first
        try:
            res = supabase.rpc("menu_sales_report").execute()
            sales_data = res.data if hasattr(res, 'data') else res
        except Exception as rpc_error:
            # Fallback to direct query if RPC doesn't exist
            print(f"RPC failed, using fallback query: {rpc_error}")
            # Check if sales_report table exists, otherwise return empty data
            try:
                res = supabase.table("sales_report").select("item_name, quantity").execute()
                # Aggregate sales by item_name manually
                sales_dict = {}
                for item in res.data:
                    item_name = item.get("item_name")
                    quantity = item.get("quantity", 0)
                    if item_name:
                        sales_dict[item_name] = sales_dict.get(item_name, 0) + quantity

                sales_data = [{"item_name": k, "total_sales": v} for k, v in sales_dict.items()]
            except Exception as table_error:
                print(f"Table query also failed: {table_error}")
                # Return empty sales data instead of error
                sales_data = []

        return JSONResponse(content={"sales": sales_data})
    except Exception as e:
        print(f"Sales endpoint error: {e}")
        # Return empty data instead of 500 error for better UX
        return JSONResponse(content={"sales": []})

from fastapi import Request

@app.get("/api/menu")
@cache(expire=300)
async def get_menu(
    category: Optional[str] = Query(None),
    inStockOnly: Optional[bool] = Query(False),
    fields: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    request: Request = None,
):
    try:
        select_fields = "*"
        if fields:
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
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        res = query.execute()
        # Get total count for pagination (optional, if supported by supabase client)
        total = None
        if hasattr(res, 'count') and res.count is not None:
            total = res.count
        headers = {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600"
        }
        return JSONResponse(content={"items": res.data, "page": page, "page_size": page_size, "total": total}, headers=headers)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Failed to fetch menu items.", "detail": str(e)})

# --- MENU INGREDIENTS ENDPOINTS ---

@app.get("/api/menu/{menu_id}/ingredients", response_model=List[MenuIngredient])
@cache(expire=120)
async def get_menu_ingredients(menu_id: int):
    try:
        res = supabase.table("menu_ingredients").select("*").eq("menu_id", menu_id).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ingredients: {e}")

@app.post("/api/menu/{menu_id}/ingredients", response_model=MenuIngredient)
async def add_menu_ingredient(menu_id: int, ingredient: MenuIngredient):
    try:
        data = ingredient.dict()
        data["menu_id"] = menu_id
        res = supabase.table("menu_ingredients").insert(data).execute()
        return res.data[0] if res.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add ingredient: {e}")

@app.put("/api/menu/{menu_id}/ingredients/{ingredient_id}", response_model=MenuIngredient)
async def update_menu_ingredient(menu_id: int, ingredient_id: int, ingredient: MenuIngredient):
    try:
        data = ingredient.dict()
        res = supabase.table("menu_ingredients").update(data).eq("menu_id", menu_id).eq("ingredient_id", ingredient_id).execute()
        return res.data[0] if res.data else data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update ingredient: {e}")

@app.delete("/api/menu/{menu_id}/ingredients/{ingredient_id}")
async def delete_menu_ingredient(menu_id: int, ingredient_id: int):
    try:
        res = supabase.table("menu_ingredients").delete().eq("menu_id", menu_id).eq("ingredient_id", ingredient_id).execute()
        return {"detail": "Deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete ingredient: {e}")


@app.get("/api/menu/{menu_id}")
@cache(expire=120)
async def get_menu_item(menu_id: int):
    try:
        res = supabase.table("menu").select("*").eq("menu_id", menu_id).single().execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Menu item not found")
        headers = {"Cache-Control": "s-maxage=60, stale-while-revalidate=300"}
        return JSONResponse(content=res.data, headers=headers)
    except HTTPException as he:
        raise he
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Failed to fetch menu item.", "detail": str(e)})

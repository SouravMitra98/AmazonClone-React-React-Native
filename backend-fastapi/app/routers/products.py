from fastapi import APIRouter, HTTPException, Query
from app.db import db
from app.schemas import ProductIn
from typing import List
from bson import ObjectId

router = APIRouter()


@router.post("/", response_model=dict)
async def create_product(payload: ProductIn):
    doc = payload.model_dump()
    result = await db.products.insert_one(doc)
    created = await db.products.find_one({"_id": result.inserted_id})
    return created


@router.get("/", response_model=List[dict])
async def list_proudtcs(q: str = Query(None), skip: int = 0, limit: int = 20):
    filter_ = {}
    if q:
        filter_ = {
            "$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
            ]
        }
    Cursor = db.products.find(filter_).skip(skip).limit(limit)
    result = []
    async for p in Cursor:
        p["_id"] = str(p["_id"])
        result.append(p)
    return result


@router.get("/{product_id}", response_model=dict)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        raise HTTPException(status_code=404, detail="Product nof found")
    p["_id"] = str(p["_id"])
    return p


@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: str, payload: ProductIn):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Id")

    update_data = payload.model_dump()
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await db.products.find_one({"_id": ObjectId(product_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    updated["_id"] = str(updated["_id"])
    return updated


@router.get("/category/{category_name}", response_model=List[dict])
async def get_products_by_category(category_name: str):
    cursor = db.products.find({"category": {"$regex": category_name, "$options": "i"}})

    items = []
    async for p in cursor:
        p["_id"] = str(p["_id"])
        items.append(p)

    return items


@router.delete("/{product_id}", response_model=dict)
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Id")

    result = await db.products.delete_one({"_id": ObjectId(product_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"status": True, "message": "Product deleted"}

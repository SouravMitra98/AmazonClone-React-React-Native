import http
from unicodedata import category
from fastapi import APIRouter, HTTPException, Depends
from app.db import db
from app.schemas import ProductIn, CategoryIn, CategoryUpdate
from app.routers.admin_auth import admin_required
from bson import ObjectId
from typing import List

router = APIRouter(prefix="", tags=["Admin Products"])


@router.get("/products", dependencies=[Depends(admin_required)])
async def list_products():
    items = []
    cursor = db.products.find({})
    async for p in cursor:
        p["_id"] = str(p["_id"])
        items.append(p)
    return items


@router.post("/products", dependencies=[Depends(admin_required)])
async def create_product(payload: ProductIn):
    res = await db.products.insert_one(payload.model_dump())
    p = await db.products.find_one({"_id": res.inserted_id})
    if p is None:
        raise HTTPException(
            status_code=404, detail="Product not found after inserting."
        )
    p["_id"] = str(p["_id"])
    return p


@router.put("/products/{product_id}", dependencies=[Depends(admin_required)])
async def update_product(product_id: str, payload: ProductIn):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Id")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": payload.model_dump()}
    )
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(status_code=400, detail="Product Not Updated")
    p["_id"] = str(p["_id"])
    return p


@router.patch("/products/{product_id}/price", dependencies=[Depends(admin_required)])
async def change_price(product_id: str, price: float):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product id")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"price": price}}
    )
    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(status_code=400, detail="Product price is not updated")
    p["_id"] = str(p["_id"])
    return p


@router.patch("/products/{product_id}/stock", dependencies=[Depends(admin_required)])
async def change_stock(product_id: str, stock: float):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid ProductId")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"stock": stock}}
    )

    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(status_code=400, detail="Product stock is not updated")
    p["_id"] = str(p["_id"])
    return p


@router.patch("/products/{product_id}/title", dependencies=[Depends(admin_required)])
async def chnage_title(product_id: str, title: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product Id")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"title": title}}
    )

    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(status_code=400, detail="Product title is not updated")
    p["_id"] = str(p["_id"])
    return p


@router.patch(
    "/products/{product_id}/description", dependencies=[Depends(admin_required)]
)
async def change_description(product_id: str, description: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product Id")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"description": description}}
    )

    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(
            status_code=400, detail="Product description is not Updated"
        )
    p["_id"] = str(p["_id"])
    return p


@router.patch("/products/{product_id}/category", dependencies=[Depends(admin_required)])
async def change_category(product_id: str, category: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product Id")
    await db.products.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"category": category}}
    )

    p = await db.products.find_one({"_id": ObjectId(product_id)})
    if p is None:
        raise HTTPException(status_code=400, detail="Product category is not updated")
    p["_id"] = str(p["_id"])
    return p


@router.delete("/products/{product_id}", dependencies=[Depends(admin_required)])
async def delete_product(product_id: str):
    if not ObjectId(product_id):
        raise HTTPException(status_code=400, detail="Invalid Product Id")
    await db.products.delete_one({"_id": ObjectId(product_id)})
    return {"Ok": True}


@router.get("/categories", dependencies=[Depends(admin_required)])
async def list_categories():
    items = []
    cursor = db.categories.find({})
    async for c in cursor:
        c["_id"] = str(c["_id"])
        items.append(c)
    return items


@router.patch("/categories/{cat_id}", dependencies=[Depends(admin_required)])
async def update_category(cat_id: str, payload: CategoryUpdate):
    if not ObjectId.is_valid(cat_id):
        raise HTTPException(status_code=400, detail="Invalid category Id")

    await db.categories.update_one(
        {"_id": ObjectId(cat_id)}, {"$set": {"name": payload.name}}
    )

    return {"ok": True}


@router.post("/categories", dependencies=[Depends(admin_required)])
async def create_category(payload: CategoryIn):
    res = await db.categories.insert_one({"name": payload.name})
    return {"_id": str(res.inserted_id), "name": payload.name}


@router.delete("/categories/{cat_id}", dependencies=[Depends(admin_required)])
async def delete_category(cat_id: str):
    if not ObjectId.is_valid(cat_id):
        raise HTTPException(status_code=400, detail="Invalid category Id")
    await db.products.update_many({"category": cat_id}, {"$set": {"category": None}})
    await db.categories.delete_one({"_id": ObjectId(cat_id)})
    return {"ok": True}

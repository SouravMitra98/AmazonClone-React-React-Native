from math import exp
from fastapi import APIRouter, HTTPException
from app.db import db
from app.schemas import Rating
from bson import ObjectId

router = APIRouter()


@router.post("/")
async def add_rating(r: Rating):
    if r.rating < 1 or r.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    await db.ratings.update_one(
        {"product_id": r.product_id, "user_id": r.user_id},
        {"$set": r.model_dump()},
        upsert=True,
    )

    cursor = db.ratings.find({"product_id": r.product_id})
    total = 0
    count = 0

    async for it in cursor:
        total += it["rating"]
        count += 1

    avgRating = total / count if count else 0
    try:
        await db.products.update_one(
            {"_id": ObjectId(str(r.product_id))},
            {"$set": {"avg_rating": avgRating, "rating_count": count}},
        )
    except:
        pass

    return {"ok": True, "avg_rating": avgRating, "rating_count": count}


@router.get("/{product_id}")
async def get_ratings(product_id: str):
    items = []
    cursor = db.ratings.find({"product_id": product_id})
    async for it in cursor:
        items.append(it)
    product = await db.products.find_one({"id": ObjectId(product_id)})
    summary = {
        "avg_rating": product.get("avg_rating", 0) if product else 0,
        "rating_count": product.get("rating_count", 0) if product else 0,
    }
    return {"ratings": items, "summary": summary}

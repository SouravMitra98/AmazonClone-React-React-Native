from fastapi import APIRouter, HTTPException, Request
from app.db import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

VALID_STATUSES = [
    "pending",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
]


@router.get("/orders")
async def get_all_orders(request: Request):
    orders = []
    cursor = db.orders.find({})

    async for o in cursor:
        user = await db.users.find_one({"_id": ObjectId(o["user_id"])})

        o["_id"] = str(o["_id"])
        o["user"] = (
            {
                "name": user.get("name"),
                "email": user.get("email"),
            }
            if user
            else {"email": "Unknown"}
        )

        orders.append(o)

    return orders


@router.patch("/orders/{order_id}")
async def admin_update_order(order_id: str, payload: dict):
    status = payload.get("status")

    if status not in VALID_STATUSES:
        raise HTTPException(400, "Invalid status")

    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(404, "Order not found")

    updates = {"status": status, f"timeline.{status}": datetime.utcnow()}

    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": updates},
    )

    return {"message": "Order updated", "status": status}

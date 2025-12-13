from fastapi import APIRouter, HTTPException, Request
from app.db import db
from app.schemas import OrderCreate
from datetime import datetime
from bson import ObjectId

router = APIRouter()

VALID_STATUSES = [
    "pending",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
]


@router.post("/")
async def create_order(o: OrderCreate, request: Request):
    user = request.state.user

    order_data = o.model_dump()

    address = order_data.get("address") or user.get("address")

    if not address:
        raise HTTPException(
            400, "Delivery address not found. Please update your profile."
        )

    order_data["address"] = address

    order_data["payment_method"] = order_data.get("payment_method") or "unknown"
    order_data["payment_id"] = order_data.get("payment_id") or "unknown"

    order_data["user_id"] = str(user["id"])
    order_data["status"] = "pending"
    order_data["created_at"] = datetime.utcnow()

    order_data["timeline"] = {
        "pending": datetime.utcnow(),
        "packed": None,
        "shipped": None,
        "out_for_delivery": None,
        "delivered": None,
        "cancelled": None,
    }

    result = await db.orders.insert_one(order_data)
    saved = await db.orders.find_one({"_id": result.inserted_id})

    if not saved:
        raise HTTPException(500, "Failed to save order")

    for it in saved["items"]:
        await db.products.update_one(
            {"_id": ObjectId(it["product_id"])},
            {"$inc": {"stock": -it["quantity"]}},
        )

    await db.carts.delete_one({"user_id": str(user["id"])})

    saved["_id"] = str(saved["_id"])
    return saved


@router.get("/")
async def list_orders(request: Request):
    user = request.state.user
    uid = str(user["id"])

    output = []
    cursor = db.orders.find({"user_id": uid}).sort("created_at", -1)
    async for o in cursor:
        o["_id"] = str(o["_id"])
        output.append(o)

    return output


@router.patch("/{order_id}")
async def update_order(order_id: str, body: dict, request: Request):
    user = request.state.user
    uid = str(user["id"])

    status = body.get("status")
    if status not in VALID_STATUSES:
        raise HTTPException(400, "Invalid status")

    order = await db.orders.find_one({"_id": ObjectId(order_id)})

    if not order:
        raise HTTPException(404, "Order not found")

    if order["user_id"] != uid:
        raise HTTPException(403, "Not allowed")

    if status == "cancelled":
        for it in order["items"]:
            await db.products.update_one(
                {"_id": ObjectId(it["product_id"])},
                {"$inc": {"stock": it["quantity"]}},
            )

    updates = {"status": status, f"timeline.{status}": datetime.utcnow()}

    await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": updates})

    return {"ok": True, "new_status": status}

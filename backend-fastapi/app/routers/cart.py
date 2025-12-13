from fastapi import APIRouter
from app.db import db
from app.schemas import CartItems

router = APIRouter()


@router.get("/{user_id}")
async def get_cart_items(user_id: str):
    cart = await db.carts.find_one({"user_id": user_id})

    if not cart:
        return {"user_id": user_id, "items": []}

    cart["_id"] = str(cart["_id"])

    if "items" not in cart:
        cart["items"] = []

    for it in cart["items"]:
        it["product_id"] = str(it["product_id"])

    return cart


@router.post("/{user_id}/add")
async def add_to_cart(user_id: str, item: CartItems):

    cart_item = item.model_dump()
    cart_item["product_id"] = str(cart_item["product_id"])

    await db.carts.update_one(
        {"user_id": user_id},
        {"$push": {"items": cart_item}},
        upsert=True,
    )

    cart = await db.carts.find_one({"user_id": user_id})

    if cart:
        cart["_id"] = str(cart["_id"])
        for it in cart["items"]:
            it["product_id"] = str(it["product_id"])

    return cart


@router.post("/{user_id}/clear")
async def clear_cart(user_id: str):
    await db.carts.delete_one({"user_id": user_id})
    return {"ok": True}


@router.post("/{user_id}/remove")
async def remove_from_cart(user_id: str, item: CartItems):

    product_id = str(item.product_id)

    cart = await db.carts.find_one({"user_id": user_id})

    if not cart:
        return {"user_id": user_id, "items": []}

    new_items = []
    removed = False

    for it in cart["items"]:
        if str(it["product_id"]) == product_id and not removed:
            removed = True
            continue
        new_items.append(it)

    if len(new_items) == 0:
        await db.carts.delete_one({"user_id": user_id})
        return {"user_id": user_id, "items": []}

    await db.carts.update_one({"user_id": user_id}, {"$set": {"items": new_items}})

    updated = await db.carts.find_one({"user_id": user_id})

    if not updated:
        return {"user_id": user_id, "items": []}

    updated["_id"] = str(updated["_id"])

    if "items" not in updated:
        updated["items"] = []

    for it in updated["items"]:
        it["product_id"] = str(it["product_id"])

    return updated

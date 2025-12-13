from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.db import db
from app.schemas import UserProfileResponse, UserUpdate
from app.routers.user_auth import require_user

router = APIRouter(prefix="/user", tags=["User Profile"])


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(user=Depends(require_user)):

    u = await db.users.find_one({"_id": user["_id"]})

    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "_id": str(u["_id"]),
        "name": u.get("name"),
        "email": u.get("email"),
        "address": u.get("address"),
    }


@router.put("/update")
async def update_profile(payload: UserUpdate, user=Depends(require_user)):
    update_data = {}

    if payload.name is not None:
        update_data["name"] = payload.name

    if payload.address is not None:
        update_data["address"] = payload.address

    await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})

    updated = await db.users.find_one({"_id": user["_id"]})

    if not updated:
        raise HTTPException(500, "Failed to fetch updated profile")

    return {
        "_id": str(updated["_id"]),
        "name": updated.get("name"),
        "email": updated.get("email"),
        "address": updated.get("address"),
    }

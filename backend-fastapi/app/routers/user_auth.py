from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from bson import ObjectId

from app.schemas import UserModel, UserLogin
from app.db import db
from app.utils import create_user_token, verify_user_token

router = APIRouter()

oauth2_schema = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register")
async def register_user(payload: UserModel):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    hashed_pw = pwd_context.hash(payload.password)

    user = {
        "name": payload.name,
        "email": payload.email,
        "password": hashed_pw,
        "role": "user",
    }

    result = await db.users.insert_one(user)

    return {"message": "User created successfully", "id": str(result.inserted_id)}


@router.post("/login")
async def user_login(payload: UserLogin):
    user = await db.users.find_one({"email": payload.email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not pwd_context.verify(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_user_token({"id": str(user["_id"]), "role": user["role"]})

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        },
    }


@router.get("/me")
async def get_authenticated_user(token: str = Depends(oauth2_schema)):
    res = verify_user_token(token)

    if not res:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await db.users.find_one({"_id": ObjectId(res["id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])
    return user


async def require_user(token: str = Depends(oauth2_schema)):
    res = verify_user_token(token)

    if not res:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        _id = ObjectId(res["id"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

    user = await db.users.find_one({"_id": _id})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = _id
    user["id"] = str(_id)

    return user

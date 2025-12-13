from venv import create
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import os
from app.utils import create_token, verify_token
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@admin.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin1234")

router = APIRouter()


class LogIn(BaseModel):
    email: str
    password: str


@router.post("/login")
async def admin_login(payload: LogIn):
    if payload.email != ADMIN_EMAIL or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    token = create_token({"role": "admin", "email": ADMIN_EMAIL})
    return {"token": token, "admin": {"email": ADMIN_EMAIL}}


def admin_required(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization missing header")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization Invalid")
    token = authorization.split(" ")[1]
    data = verify_token(token)
    if not data or data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Denied")
    return data

import os, time, jwt
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()


JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "change_admin_jwt_secret")
JWT_EXP = int(os.getenv("ADMIN_JWT_EXP", "3600"))  # FIX: default must be string

USER_JWT_SECRET = os.getenv("USER_JWT_SECRET", "change_user_jwt_secret")
USER_JWT_EXP = int(os.getenv("USER_JWT_EXP", "86400"))  # FIX: default must be string


def create_token(payload: dict) -> str:
    payload = payload.copy()
    payload["exp"] = int(time.time()) + JWT_EXP
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str):
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Admin Token Expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid Admin Token")


def create_user_token(payload: dict) -> str:
    payload = payload.copy()
    payload["exp"] = int(time.time()) + USER_JWT_EXP
    return jwt.encode(payload, USER_JWT_SECRET, algorithm="HS256")


def verify_user_token(token: str):
    try:
        data = jwt.decode(token, USER_JWT_SECRET, algorithms=["HS256"])
        return data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="User Token Expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid User Token")

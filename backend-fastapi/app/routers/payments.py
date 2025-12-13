from fastapi import APIRouter, HTTPException, Request, Depends, Query
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import stripe, requests, hmac, hashlib
from typing import Optional
from app.routers.admin_auth import admin_required
from app.db import db
from bson import ObjectId

load_dotenv()


STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRETS", "")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

if STRIPE_KEY:
    stripe.api_key = STRIPE_KEY

router = APIRouter()


@router.post("/stripe/create-payment-intent")
async def stripe_create_payment_intent(amount: float, currency: str = "inr"):
    if not STRIPE_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    amt = int(round(amount * 100))

    intent = stripe.PaymentIntent.create(
        amount=amt, currency=currency, payment_method_types=["card"]
    )

    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@router.post("/razorpay/create-order")
async def razorpay_order_create(
    amount: float = Query(...),
    currency: str = "INR",
    receipt: Optional[str] = None,
):

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay not configured")

    amount_paise = int(round(amount * 100))

    payload = {
        "amount": amount_paise,
        "currency": currency,
        "receipt": receipt or "order_receipt",
    }

    res = requests.post(
        "https://api.razorpay.com/v1/orders",
        json=payload,
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
    )

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return {"order": res.json(), "key_id": RAZORPAY_KEY_ID}


@router.post("/razorpay/verify")
async def razorpay_verify(payload: dict):

    r_order = payload.get("razorpay_order_id")
    r_payment = payload.get("razorpay_payment_id")
    r_signature = payload.get("razorpay_signature")
    order_id = payload.get("order_id")

    if not (r_order and r_payment and r_signature):
        raise HTTPException(400, "Missing required Razorpay fields")

    message = f"{r_order}|{r_payment}"

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(), message.encode(), hashlib.sha256
    ).hexdigest()

    if expected_signature != r_signature:
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    if order_id:
        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "status": "paid",
                    "payment_method": "razorpay",
                    "payment_id": r_payment,
                }
            },
        )

    return {"success": True}


@router.post("/refund/razorpay", dependencies=[Depends(admin_required)])
async def razorpay_refund(payment_id: str, amount: Optional[float] = None):

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay not configured")

    url = f"https://api.razorpay.com/v1/payments/{payment_id}/refund"

    payload = {}
    if amount:
        payload["amount"] = int(round(amount * 100))

    res = requests.post(url, json=payload, auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    if res.status_code not in (200, 201):
        raise HTTPException(status_code=res.status_code, detail=res.text)

    return res.json()


@router.post("/refund/stripe", dependencies=[Depends(admin_required)])
async def stripe_refund(payment_intent_id: str):

    try:
        refund = stripe.Refund.create(payment_intent=payment_intent_id)
        return {"success": True, "refund": refund}
    except Exception as e:
        raise HTTPException(400, detail=str(e))

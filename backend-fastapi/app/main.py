from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (
    products,
    cart,
    orders,
    ratings,
    admin_auth,
    admin_products,
    payments,
    ws_carts,
    user_auth,
    admin_orders,
)
from app.routers.user_profile import router as user_profile_router
from app.middleware.auth import AuthMiddleware


app = FastAPI(title="Amazon Clone")

app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(ratings.router, prefix="/ratings", tags=["ratings"])
app.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin_auth"])
app.include_router(user_auth.router, prefix="/auth", tags=["users"])
app.include_router(admin_products.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(ws_carts.router, prefix="/ws", tags=["ws"])
app.include_router(admin_orders.router, prefix="/admin", tags=["admin_orders"])
app.include_router(user_profile_router)


@app.get("/")
async def root():
    return {"message": "Amazon Clone"}

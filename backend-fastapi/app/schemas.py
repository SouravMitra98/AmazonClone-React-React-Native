import email
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List


class UserModel(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class ProductIn(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    images: List[str] = []
    category: Optional[str] = Field(None, min_length=2)
    stock: int = Field(0, ge=0)
    rating: float = Field(0.0, ge=0, le=5)


class CartItems(BaseModel):
    product_id: str
    quantity: int


class OrderCreate(BaseModel):
    items: List[CartItems]
    address: Optional[str] = None
    totalprice: float
    payment_id: Optional[str] = None


class Rating(BaseModel):
    user_id: str
    product_id: str
    rating: int
    review: str | None = None


class RazorpayOrderIn(BaseModel):
    amount: float
    currency: str = "INR"
    receipt: Optional[str] = None


class CategoryIn(BaseModel):
    name: str = Field(..., min_length=2)


class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=2)


class UserProfileResponse(BaseModel):
    _id: str
    name: str
    email: EmailStr
    address: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None

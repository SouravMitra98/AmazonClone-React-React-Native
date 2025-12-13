from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.utils import verify_token, verify_user_token


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):  # type: ignore
        public_paths = [
            "/user/register",
            "/user/login",
            "/admin/login",
            "/admin/auth/login",
            "/openapi.json",
            "/auth/login",
            "/payments/razorpay/create-order",
            "/payments/razorpay/verify",
            "/payments/stripe/create-payment-intent",
            # Optional:
            "/webhooks/stripe",
            "/webhooks/razorpay",
        ]

        normalized_path = request.url.path.rstrip("/")

        if normalized_path in public_paths or normalized_path.startswith("/static"):
            return await call_next(request)

        if any(request.url.path.startswith(p) for p in public_paths):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"error": "Missing or invalid token"},
            )

        token = auth_header.split(" ")[1]

        if normalized_path.startswith("/admin"):
            data = verify_token(token)
        else:
            data = verify_user_token(token)

        if not data:
            return JSONResponse(
                status_code=401,
                content={"error": "Token authentication failed"},
            )

        request.state.user = data
        return await call_next(request)

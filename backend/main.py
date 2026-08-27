from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.chat import router as chat_router
from routes.push import router as push_router
from routes.push_test import router as push_test_router
from routes.stream import router as stream_router
from routes.auth_webhook import router as auth_webhook_router
from routes.admin import router as admin_router
from routes.notifications import router as notifications_router
from routes.reminders import router as reminders_router
from routes.analytics import router as analytics_router
from routes.recovery import router as recovery_router
from routes.timeline import router as timeline_router
import time

app = FastAPI(
    title="HomeCare AI",
    description="Safe home care guidance for minor symptoms",
    version="1.0.0"
)

# CORS - restricted to known origins
ALLOWED_ORIGINS = [
    "https://homecareai.vercel.app",
    "https://homecareai-git-main.vercel.app",
    "https://homecareai-git-deploy.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Simple rate limiting (in-memory)
rate_limit_store = {}

@app.middleware("http")
async def rate_limiter(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Clean old entries
    if client_ip in rate_limit_store:
        rate_limit_store[client_ip] = [
            t for t in rate_limit_store[client_ip] if now - t < 60
        ]
    else:
        rate_limit_store[client_ip] = []
    
    # Limit: 30 requests per minute per IP
    if len(rate_limit_store.get(client_ip, [])) >= 30:
        return JSONResponse(
            status_code=429,
            content={"error": "Too many requests. Please wait a moment."}
        )
    
    rate_limit_store[client_ip].append(now)
    response = await call_next(request)
    return response

# Global exception handler - never leak internal errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Please try again later."}
    )

app.include_router(chat_router, prefix="/api")
app.include_router(push_router, prefix="/api/push")
app.include_router(push_test_router, prefix="/api/push")
app.include_router(stream_router, prefix="/api")
app.include_router(auth_webhook_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(reminders_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(recovery_router, prefix="/api/recovery")
app.include_router(timeline_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "HomeCare AI 🌿",
        "status": "running",
        "message": "Natural home care guidance API"
    }
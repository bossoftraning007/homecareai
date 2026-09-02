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
from routes.wellness import router as wellness_router
from routes.reports import router as reports_router
from routes.dashboard import router as dashboard_router
from middleware.security import (
    SECURITY_HEADERS,
    CSP_POLICY,
    rate_limiter,
    hash_ip,
)
import time
import os

app = FastAPI(
    title="HomeCare AI",
    description="Safe home care guidance for minor symptoms",
    version="1.0.0",
    docs_url=None,  # Disable Swagger UI in production
    redoc_url=None,  # Disable ReDoc in production
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
    allow_headers=["Content-Type", "Authorization", "x-user-id", "x-csrf-token"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
)


# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Add security headers
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value
    
    # Add Content Security Policy
    response.headers["Content-Security-Policy"] = CSP_POLICY
    
    # Add Cache Control for sensitive pages
    if request.url.path.startswith("/api/admin"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
    
    return response


# Enhanced rate limiting middleware
@app.middleware("http")
async def rate_limiter_middleware(request: Request, call_next):
    """Enhanced rate limiting with IP blocking."""
    client_ip = request.client.host if request.client else "unknown"
    
    # Skip rate limiting for health checks
    if request.url.path == "/":
        return await call_next(request)
    
    # Check rate limit
    if not rate_limiter.check_rate_limit(client_ip):
        # Log blocked IP (hashed for privacy)
        hashed_ip = hash_ip(client_ip)
        print(f"Rate limit exceeded for IP: {hashed_ip}")
        
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too many requests. Please wait a moment.",
                "retry_after": 60,
            },
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": "30",
                "X-RateLimit-Remaining": "0",
            },
        )
    
    response = await call_next(request)
    
    # Add rate limit info to response
    response.headers["X-RateLimit-Limit"] = "30"
    response.headers["X-RateLimit-Remaining"] = str(
        max(0, 30 - len(rate_limiter.requests.get(client_ip, [])))
    )
    
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
app.include_router(wellness_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "HomeCare AI 🌿",
        "status": "running",
        "message": "Natural home care guidance API"
    }
"""Security middleware and utilities for HomeCare AI."""
import os
import re
import hashlib
import secrets
from functools import wraps
from fastapi import Request, HTTPException

# Security Headers Configuration
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
}

# Content Security Policy
CSP_POLICY = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https://*.supabase.co https://*.supabase.in; "
    "frame-src 'self' https://accounts.google.com; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'none';"
)


class RateLimiter:
    """Enhanced rate limiter with IP blocking."""
    
    def __init__(self):
        self.requests = {}
        self.blocked_ips = {}
        self.max_requests = 30  # per minute
        self.block_duration = 3600  # 1 hour
    
    def is_blocked(self, ip: str) -> bool:
        """Check if IP is blocked."""
        if ip in self.blocked_ips:
            if self.blocked_ips[ip] > self._now():
                return True
            del self.blocked_ips[ip]
        return False
    
    def check_rate_limit(self, ip: str) -> bool:
        """Check if request is within rate limit. Returns True if allowed."""
        now = self._now()
        
        # Clean old entries
        if ip in self.requests:
            self.requests[ip] = [t for t in self.requests[ip] if now - t < 60]
        else:
            self.requests[ip] = []
        
        # Check if blocked
        if self.is_blocked(ip):
            return False
        
        # Check rate limit
        if len(self.requests.get(ip, [])) >= self.max_requests:
            self.blocked_ips[ip] = now + self.block_duration
            return False
        
        self.requests[ip].append(now)
        return True
    
    def _now(self) -> int:
        import time
        return int(time.time())


# Global rate limiter instance
rate_limiter = RateLimiter()


def sanitize_input(text: str, max_length: int = 1000) -> str:
    """Sanitize user input to prevent XSS and injection attacks."""
    if not text:
        return ""
    
    # Truncate
    text = text[:max_length]
    
    # Remove potentially dangerous characters
    text = re.sub(r'[<>\"\'%;()&+]', '', text)
    
    # Remove script tags and event handlers
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    return text.strip()


def generate_csrf_token() -> str:
    """Generate a CSRF token."""
    return secrets.token_urlsafe(32)


def verify_csrf_token(token: str, stored_token: str) -> bool:
    """Verify CSRF token using constant-time comparison."""
    return secrets.compare_digest(token, stored_token)


def hash_ip(ip: str) -> str:
    """Hash IP address for logging (privacy)."""
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def require_admin(func):
    """Decorator to require admin access."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get('request')
        if not request:
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
        
        if not request:
            raise HTTPException(status_code=500, detail="Request object not found")
        
        # Check admin header or token
        admin_token = request.headers.get("x-admin-token")
        expected_token = os.getenv("ADMIN_SECRET_TOKEN")
        
        if not expected_token:
            raise HTTPException(status_code=500, detail="Admin token not configured")
        
        if not admin_token or not secrets.compare_digest(admin_token, expected_token):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return await func(*args, **kwargs)
    return wrapper

from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def get_user_or_ip(request: Request):
    """Returns user ID if authenticated, else falls back to the REAL client IP.

    IMPORTANT: Behind Cloudflare, request.client.host is the Cloudflare edge IP,
    not the real client. get_remote_address() returns that Cloudflare IP, which means
    ALL users would share a single rate-limit bucket — effectively disabling the limiter.

    The security_middleware in main.py reads CF-Connecting-IP and stores the real IP
    in request.state.real_ip. We use that here so each client gets its own bucket.
    """
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    # real_ip is set by security_middleware from CF-Connecting-IP (Cloudflare real client IP)
    real_ip = getattr(request.state, "real_ip", None)
    if real_ip:
        return real_ip
    # Fallback for local dev where there is no Cloudflare in front
    return get_remote_address(request)

limiter = Limiter(key_func=get_user_or_ip)

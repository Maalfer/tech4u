"""
Redis cache utility — graceful fallback if Redis is not available.
"""
import os, json, logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

try:
    import redis
    _client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True,
        socket_connect_timeout=1,
        socket_timeout=1,
    )
    _client.ping()
    REDIS_AVAILABLE = True
    logger.info("Redis connected successfully")
except Exception as e:
    _client = None
    REDIS_AVAILABLE = False
    logger.warning(f"Redis not available, caching disabled: {e}")


def cache_get(key: str) -> Optional[Any]:
    if not REDIS_AVAILABLE or _client is None:
        return None
    try:
        val = _client.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


def cache_set(key: str, value: Any, ttl: int = 60) -> None:
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


def cache_delete(key: str) -> None:
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        _client.delete(key)
    except Exception:
        pass


def cache_delete_pattern(pattern: str) -> None:
    if not REDIS_AVAILABLE or _client is None:
        return
    try:
        keys = _client.keys(pattern)
        if keys:
            _client.delete(*keys)
    except Exception:
        pass

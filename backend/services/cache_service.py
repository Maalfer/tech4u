import redis
import os
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            self.client.ping()
            self.available = True
            logger.info(f"Redis connected at {self.redis_url}")
        except Exception as e:
            self.available = False
            self.client = None
            logger.warning(f"Redis not available: {e}. Caching will be disabled.")

    def get(self, key: str) -> Optional[Any]:
        if not self.available:
            return None
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Sets a key in cache. default expire 5 minutes."""
        if not self.available:
            return False
        try:
            self.client.set(key, json.dumps(value), ex=expire)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        if not self.available:
            return False
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

cache_service = CacheService()

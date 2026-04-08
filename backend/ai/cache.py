import hashlib
import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

CACHE = {}
CACHE_TTL = timedelta(hours=24)


def get_cache_key(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def get_cached(key: str) -> Optional[Dict[str, Any]]:
    if key in CACHE:
        entry = CACHE[key]
        if datetime.utcnow() < entry["expires"]:
            return entry["data"]
        del CACHE[key]
    return None


def set_cached(key: str, data: Dict[str, Any], ttl_hours: int = 24):
    CACHE[key] = {
        "data": data,
        "expires": datetime.utcnow() + timedelta(hours=ttl_hours),
        "created": datetime.utcnow(),
    }

    while len(CACHE) > 100:
        oldest = min(CACHE.keys(), key=lambda k: CACHE[k]["created"])
        del CACHE[oldest]


def get_ai_response(intent: str) -> Optional[Dict[str, Any]]:
    key = get_cache_key(intent)
    return get_cached(key)


def cache_ai_response(intent: str, data: Dict[str, Any]):
    key = get_cache_key(intent)
    set_cached(key, data)


def clear_cache():
    CACHE.clear()

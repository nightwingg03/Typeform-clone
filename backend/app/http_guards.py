"""HTTP middleware helpers: body size cap and in-process rate limits."""

import re
import time
from collections import defaultdict

from starlette.requests import Request
from starlette.responses import JSONResponse, Response

MAX_BODY_BYTES = 2097152
WINDOW_SECONDS = 60.0

_POST_RESPONSES = re.compile(r"^/api/public/forms/[^/]+/responses$")
_GET_PUBLIC_FORM = re.compile(r"^/api/public/forms/[^/]+$")

_rate_buckets: dict[str, list[float]] = defaultdict(list)


def client_ip(request: Request) -> str:
    if request.client is not None:
        return request.client.host
    return "unknown"


def body_too_large(request: Request) -> Response | None:
    content_length = request.headers.get("content-length")
    if content_length is None:
        return None
    try:
        length = int(content_length, 10)
    except ValueError:
        return JSONResponse(
            status_code=400,
            content={"detail": "Invalid Content-Length"},
        )
    if length > MAX_BODY_BYTES:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request body is too large"},
        )
    return None


def rate_limit(request: Request) -> Response | None:
    method = request.method
    path = request.url.path

    limit: int | None = None
    if method == "POST" and _POST_RESPONSES.fullmatch(path):
        limit = 10
    elif method == "GET" and _GET_PUBLIC_FORM.fullmatch(path):
        limit = 60
    else:
        return None

    ip = client_ip(request)
    now = time.monotonic()
    cutoff = now - WINDOW_SECONDS
    timestamps = _rate_buckets[ip]
    timestamps[:] = [t for t in timestamps if t > cutoff]

    if len(timestamps) >= limit:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests"},
        )

    timestamps.append(now)
    return None

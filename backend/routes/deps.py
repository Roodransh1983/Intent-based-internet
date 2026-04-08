from fastapi import Header, HTTPException


async def get_current_user(authorization: str | None = Header(default=None)):
    from auth import decode_token

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        payload = decode_token(token)
    except Exception as exc:
        raise HTTPException(401, "Invalid token") from exc

    return {"id": payload["sub"]}

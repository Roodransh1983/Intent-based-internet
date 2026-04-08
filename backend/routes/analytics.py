from fastapi import APIRouter, Depends
from datetime import datetime
from config import get_db
from routes.deps import get_current_user

router = APIRouter(tags=["analytics"])


@router.post("/analytics")
async def save_analytics(analytics: dict, user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        return {"status": "db_unavailable"}

    analytics["user_id"] = user["id"]
    analytics["updated_at"] = datetime.utcnow()

    existing = db.analytics.find_one({"user_id": user["id"]})
    if existing:
        db.analytics.update_one({"user_id": user["id"]}, {"$set": analytics})
    else:
        db.analytics.insert_one(analytics)

    return {"status": "saved"}


@router.get("/analytics")
async def get_analytics(user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        return {}

    analytics = db.analytics.find_one({"user_id": user["id"]})
    if analytics:
        analytics["_id"] = str(analytics["_id"])
        return analytics
    return {}

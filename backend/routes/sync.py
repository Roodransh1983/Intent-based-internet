from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from config import get_db
from bson import ObjectId
from routes.deps import get_current_user

router = APIRouter(tags=["sync"])


@router.post("/sync")
async def sync_batch(sync_items: list, user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    results = {"processed": 0, "failed": 0}

    for item in sync_items:
        try:
            collection = item.get("endpoint", "").split("/")[1]
            method = item.get("method", "POST")
            data = item.get("data", {})

            if collection not in ["goals", "tasks", "milestones", "progress"]:
                results["failed"] += 1
                continue

            data["user_id"] = user["id"]
            data["updated_at"] = datetime.utcnow()

            if method == "POST":
                db[collection].insert_one(data)
            elif method == "PATCH":
                item_id = data.get("id") or data.get("_id")
                if item_id:
                    db[collection].update_one(
                        {"_id": ObjectId(item_id), "user_id": user["id"]},
                        {"$set": data},
                    )

            results["processed"] += 1
        except:
            results["failed"] += 1

    return results

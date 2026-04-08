from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from config import get_db
from models import GoalCreate
from ai import generate_with_fallback, process_intent_with_ai
from database.crud import create_goal, get_user_goals, get_goal_by_id
from routes.deps import get_current_user

router = APIRouter(tags=["goals"])


@router.post("")
async def create_goal_endpoint(goal: GoalCreate, user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    result = await process_intent_with_ai(goal.intent)

    goal_doc = {
        "user_id": user["id"],
        "intent": goal.intent,
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "category": result["intent"]["category"],
        "used_fallback": result.get("used_fallback", True),
        "used_ai": result.get("used_ai", False),
    }

    inserted = db.goals.insert_one(goal_doc)
    goal_id = str(inserted.inserted_id)

    milestones = result["roadmap"]
    for milestone in milestones:
        milestone_doc = {
            "goal_id": goal_id,
            "user_id": user["id"],
            "order": milestone["order"],
            "title": milestone["title"],
            "target_date": milestone["target_date"],
            "status": milestone["status"],
            "completed": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        db.milestones.insert_one(milestone_doc)

    tasks = result["tasks"]
    for mid, task_list in tasks.items():
        for task in task_list:
            task_doc = {
                "goal_id": goal_id,
                "user_id": user["id"],
                "milestone_id": str(mid),
                "title": task["title"],
                "description": task.get("description", ""),
                "completed": False,
                "order": task["order"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            db.tasks.insert_one(task_doc)

    return {
        "goal_id": goal_id,
        "roadmap": milestones,
        "fallback": result.get("used_fallback", True),
    }


@router.get("")
async def get_goals(user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    goals = list(
        db.goals.find({"user_id": user["id"], "status": "active"}).sort(
            "created_at", -1
        )
    )
    for goal in goals:
        goal["_id"] = str(goal["_id"])
        goal["id"] = goal["_id"]
        goal["created_at"] = goal["created_at"].isoformat()
    return goals


@router.get("/{goal_id}")
async def get_goal(goal_id: str, user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    goal = db.goals.find_one({"_id": ObjectId(goal_id), "user_id": user["id"]})
    if not goal:
        raise HTTPException(404, "Goal not found")

    goal["_id"] = str(goal["_id"])
    goal["id"] = goal["_id"]
    return goal

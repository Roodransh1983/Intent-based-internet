from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from config import get_db
from models import TaskUpdate
from database.crud import get_tasks_for_goal, update_task
from routes.deps import get_current_user

router = APIRouter(tags=["tasks"])


@router.get("/tasks/{goal_id}")
async def get_tasks(goal_id: str, user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    goal = db.goals.find_one({"_id": ObjectId(goal_id), "user_id": user["id"]})
    if not goal:
        raise HTTPException(404, "Goal not found")

    tasks = list(
        db.tasks.find({"goal_id": goal_id, "user_id": user["id"]}).sort("order", 1)
    )
    for task in tasks:
        task["_id"] = str(task["_id"])
        task["id"] = task["_id"]
    return tasks


@router.patch("/tasks/{task_id}")
async def update_task_endpoint(
    task_id: str, task_data: TaskUpdate, user=Depends(get_current_user)
):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    task = db.tasks.find_one({"_id": ObjectId(task_id), "user_id": user["id"]})
    if not task:
        raise HTTPException(404, "Task not found")

    updates = {k: v for k, v in task_data.dict().items() if v is not None}
    update_task(task_id, updates)

    updated = db.tasks.find_one({"_id": ObjectId(task_id)})
    updated["_id"] = str(updated["_id"])
    return updated

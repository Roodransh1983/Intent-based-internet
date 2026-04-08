from datetime import datetime, timedelta
from bson import ObjectId
from config import get_db


def create_user(user_data: dict):
    db = get_db()
    return db.users.insert_one(user_data)


def find_user_by_email(email: str):
    db = get_db()
    return db.users.find_one({"email": email})


def find_user_by_id(user_id: str):
    db = get_db()
    return db.users.find_one({"_id": ObjectId(user_id)})


def update_user(user_id: str, updates: dict):
    db = get_db()
    updates["updated_at"] = datetime.utcnow()
    return db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})


def create_goal(goal_data: dict):
    db = get_db()
    return db.goals.insert_one(goal_data)


def get_user_goals(user_id: str, limit: int = 10):
    db = get_db()
    return list(db.goals.find({"user_id": user_id, "status": "active"}).limit(limit))


def get_goal_by_id(goal_id: str):
    db = get_db()
    return db.goals.find_one({"_id": ObjectId(goal_id)})


def update_goal(goal_id: str, updates: dict):
    db = get_db()
    updates["updated_at"] = datetime.utcnow()
    return db.goals.update_one({"_id": ObjectId(goal_id)}, {"$set": updates})


def archive_old_goals(user_id: str, days: int = 30):
    db = get_db()
    cutoff = datetime.utcnow() - timedelta(days=days)
    return db.goals.update_many(
        {"user_id": user_id, "created_at": {"$lt": cutoff}, "status": "active"},
        {"$set": {"status": "archived", "archive_date": datetime.utcnow()}},
    )


def create_milestone(milestone_data: dict):
    db = get_db()
    return db.milestones.insert_one(milestone_data)


def get_milestones_for_goal(goal_id: str):
    db = get_db()
    return list(db.milestones.find({"goal_id": goal_id}).sort("order", 1))


def create_task(task_data: dict):
    db = get_db()
    return db.tasks.insert_one(task_data)


def get_tasks_for_goal(goal_id: str):
    db = get_db()
    return list(db.tasks.find({"goal_id": goal_id}).sort("order", 1))


def get_tasks_for_milestone(milestone_id: str):
    db = get_db()
    return list(db.tasks.find({"milestone_id": milestone_id}).sort("order", 1))


def update_task(task_id: str, updates: dict):
    db = get_db()
    updates["updated_at"] = datetime.utcnow()
    if updates.get("completed"):
        updates["completed_at"] = datetime.utcnow()
    return db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": updates})


def get_user_completion_stats(user_id: str):
    db = get_db()
    pipeline = [
        {"$match": {"user_id": user_id}},
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "completed": {"$sum": {"$cond": ["$completed", 1, 0]}},
            }
        },
    ]
    result = list(db.tasks.aggregate(pipeline))
    if result:
        return result[0]
    return {"total": 0, "completed": 0}


def create_progress(progress_data: dict):
    db = get_db()
    existing = db.progress.find_one(
        {"user_id": progress_data["user_id"], "goal_id": progress_data["goal_id"]}
    )
    if existing:
        return db.progress.update_one({"_id": existing["_id"]}, {"$set": progress_data})
    return db.progress.insert_one(progress_data)


def get_progress_for_goal(goal_id: str):
    db = get_db()
    return db.progress.find_one({"goal_id": goal_id})


def get_user_progress(user_id: str):
    db = get_db()
    return list(db.progress.find({"user_id": user_id}))

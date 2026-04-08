from datetime import datetime
from typing import Optional, Dict, Any


def user_schema(email: str, name: str, hashed_password: str) -> Dict:
    return {
        "email": email,
        "name": name,
        "password_hash": hashed_password,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,
        "status": "active",
    }


def goal_schema(user_id: str, intent: str, category: str = "general") -> Dict:
    return {
        "user_id": user_id,
        "intent": intent,
        "category": category,
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "archived": False,
        "archive_date": None,
    }


def milestone_schema(
    user_id: str, goal_id: str, order: int, title: str, target_date: str
) -> Dict:
    return {
        "user_id": user_id,
        "goal_id": goal_id,
        "order": order,
        "title": title,
        "target_date": target_date,
        "status": "pending",
        "completed": False,
        "completed_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def task_schema(
    user_id: str,
    goal_id: str,
    milestone_id: str,
    order: int,
    title: str,
    description: str = "",
) -> Dict:
    return {
        "user_id": user_id,
        "goal_id": goal_id,
        "milestone_id": milestone_id,
        "order": order,
        "title": title,
        "description": description,
        "completed": False,
        "completed_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def progress_schema(
    user_id: str, goal_id: str, completed_tasks: int, total_tasks: int
) -> Dict:
    return {
        "user_id": user_id,
        "goal_id": goal_id,
        "completed_tasks": completed_tasks,
        "total_tasks": total_tasks,
        "completion_rate": completed_tasks / max(1, total_tasks),
        "last_updated": datetime.utcnow(),
    }


COLLECTIONS = ["users", "goals", "milestones", "tasks", "progress"]

INDEXES = {
    "users": [("email", 1), ("user_id", 1)],
    "goals": [("user_id", 1), ("status", 1), ("created_at", -1)],
    "milestones": [("user_id", 1), ("goal_id", 1), ("order", 1)],
    "tasks": [("user_id", 1), ("goal_id", 1), ("milestone_id", 1), ("completed", 1)],
    "progress": [("user_id", 1), ("goal_id", 1)],
}

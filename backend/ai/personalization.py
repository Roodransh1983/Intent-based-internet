from typing import Dict, List


def calculate_completion_rate(completed: int, total: int) -> float:
    if total == 0:
        return 1.0
    return completed / total


def adjust_task_load(completion_rate: float, current_tasks: int) -> int:
    if completion_rate >= 0.8:
        return min(current_tasks + 1, 6)
    elif completion_rate >= 0.5:
        return current_tasks
    elif completion_rate >= 0.3:
        return max(2, current_tasks - 1)
    else:
        return max(1, current_tasks - 2)


def get_user_profile_stats(user_tasks: List[Dict]) -> Dict:
    if not user_tasks:
        return {
            "completion_rate": 1.0,
            "avg_tasks_per_goal": 4,
            "preferred_category": "general",
            "velocity": "normal",
        }

    completed = sum(1 for t in user_tasks if t.get("completed", False))
    total = len(user_tasks)
    completion_rate = calculate_completion_rate(completed, total)

    categories = {}
    for task in user_tasks:
        cat = task.get("category", "general")
        categories[cat] = categories.get(cat, 0) + 1

    preferred = max(categories, key=categories.get) if categories else "general"

    if completion_rate >= 0.8:
        velocity = "fast"
    elif completion_rate >= 0.5:
        velocity = "normal"
    else:
        velocity = "slow"

    return {
        "completion_rate": completion_rate,
        "avg_tasks_per_goal": total
        // max(1, len(set(t.get("goal_id") for t in user_tasks))),
        "preferred_category": preferred,
        "velocity": velocity,
    }


def personalize_roadmap(roadmap: List[Dict], stats: Dict) -> List[Dict]:
    velocity = stats.get("velocity", "normal")

    if velocity == "slow":
        for milestone in roadmap:
            milestone["support_level"] = "high"
            milestone["check_in_frequency"] = "daily"
    elif velocity == "fast":
        for milestone in roadmap:
            milestone["support_level"] = "low"
            milestone["check_in_frequency"] = "weekly"
    else:
        for milestone in roadmap:
            milestone["support_level"] = "medium"
            milestone["check_in_frequency"] = "every_3_days"

    return roadmap

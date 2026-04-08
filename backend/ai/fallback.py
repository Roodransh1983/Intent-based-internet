from typing import Dict, List
from datetime import datetime, timedelta

DEFAULT_MILESTONES = [
    "Define clear objectives",
    "Gather necessary resources",
    "Create action plan",
    "Execute first phase",
    "Review and adjust",
    "Complete and celebrate",
]

DEFAULT_TASKS = [
    "Break down into steps",
    "Set deadline",
    "Remove obstacles",
    "Take action",
    "Track progress",
    "Learn and improve",
]


def fallback_roadmap(intent: str) -> List[Dict]:
    now = datetime.utcnow()
    return [
        {
            "order": i,
            "title": milestone,
            "target_date": (now + timedelta(days=14 * (i + 1))).isoformat(),
            "status": "pending",
            "is_fallback": True,
        }
        for i, milestone in enumerate(DEFAULT_MILESTONES)
    ]


def fallback_tasks(milestone_order: int, milestone_title: str) -> List[Dict]:
    return [
        {
            "title": task,
            "description": f"{task} for: {milestone_title}",
            "estimated_days": 3,
            "order": i,
            "is_fallback": True,
        }
        for i, task in enumerate(DEFAULT_TASKS[:3])
    ]


def generate_with_fallback(intent_data: Dict, use_ai: bool = False) -> Dict:
    try:
        from ai.intent import detect_intent
        from ai.roadmap import generate_roadmap
        from ai.tasks import generate_tasks

        if use_ai:
            pass

        intent = detect_intent(intent_data.get("text", ""))
        roadmap = generate_roadmap(intent)
        tasks = generate_tasks(roadmap)

        return {
            "intent": intent,
            "roadmap": roadmap,
            "tasks": tasks,
            "used_fallback": False,
        }
    except Exception as e:
        roadmap = fallback_roadmap(intent_data.get("text", ""))
        tasks = {i: fallback_tasks(i, m["title"]) for i, m in enumerate(roadmap)}

        return {
            "intent": {"category": "general", "text": intent_data.get("text", "")},
            "roadmap": roadmap,
            "tasks": tasks,
            "used_fallback": True,
            "error": str(e),
        }

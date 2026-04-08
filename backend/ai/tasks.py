from typing import List, Dict
from datetime import datetime, timedelta

TASK_TEMPLATES = {
    "Research": [
        "Identify key topics",
        "Find quality resources",
        "Create learning plan",
        "Set up tracking",
    ],
    "Set up": [
        "Install required tools",
        "Configure environment",
        "Gather materials",
        "Test setup",
    ],
    "Complete": [
        "Study core concepts",
        "Take notes",
        "Complete exercises",
        "Review understanding",
    ],
    "Build": [
        "Plan project scope",
        "Implement features",
        "Test functionality",
        "Document work",
    ],
    "Practice": [
        "Daily exercises",
        "Weekly challenges",
        "Review mistakes",
        "Track improvement",
    ],
    "Create": [
        "Brainstorm ideas",
        "Draft initial version",
        "Refine and polish",
        "Get feedback",
    ],
    "Assess": [
        "Take baseline measurement",
        "Identify gaps",
        "Set benchmarks",
        "Document findings",
    ],
    "Define": ["List objectives", "Prioritize goals", "Set metrics", "Create timeline"],
    "Update": [
        "Audit current state",
        "Make improvements",
        "Add achievements",
        "Review completeness",
    ],
    "Skill": [
        "Identify required skills",
        "Find training resources",
        "Complete courses",
        "Apply in practice",
    ],
    "Network": [
        "Identify key contacts",
        "Reach out strategically",
        "Attend events",
        "Follow up",
    ],
    "Validate": [
        "Research market",
        "Survey potential users",
        "Analyze competitors",
        "Document findings",
    ],
    "Track": [
        "Set up tracking system",
        "Log daily data",
        "Review weekly trends",
        "Adjust based on insights",
    ],
    "Implement": [
        "Plan changes",
        "Execute step by step",
        "Monitor results",
        "Refine approach",
    ],
    "Learn": [
        "Watch tutorials",
        "Read documentation",
        "Code along examples",
        "Build mini-projects",
    ],
    "Deploy": [
        "Prepare for launch",
        "Deploy to production",
        "Monitor performance",
        "Gather user feedback",
    ],
}


def match_template(title: str) -> List[str]:
    title_lower = title.lower()
    for key, tasks in TASK_TEMPLATES.items():
        if key.lower() in title_lower:
            return tasks
    return [
        "Break into steps",
        "Execute step 1",
        "Execute step 2",
        "Review and iterate",
    ]


def generate_tasks(
    milestones: List[Dict], completion_rate: float = 1.0
) -> Dict[str, List[Dict]]:
    now = datetime.utcnow()
    tasks_by_milestone = {}

    adjustment = (
        1.0 if completion_rate >= 0.7 else (0.75 if completion_rate >= 0.4 else 0.5)
    )

    for milestone in milestones:
        mid = milestone.get("order", 0)
        title = milestone.get("title", "")
        target = milestone.get("target_date", "")

        template_tasks = match_template(title)
        num_tasks = max(2, int(len(template_tasks) * adjustment))
        selected_tasks = template_tasks[:num_tasks]

        try:
            target_date = datetime.fromisoformat(target.replace("Z", "+00:00"))
        except:
            target_date = now + timedelta(days=7)

        days_between = (target_date - now).days // max(1, num_tasks)

        tasks_by_milestone[mid] = [
            {
                "title": task,
                "description": f"Task {i + 1} for milestone: {title}",
                "estimated_days": days_between,
                "order": i,
            }
            for i, task in enumerate(selected_tasks)
        ]

    return tasks_by_milestone

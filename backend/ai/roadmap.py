from typing import List, Dict
from datetime import datetime, timedelta

ROADMAP_TEMPLATES = {
    "learning": [
        "Research fundamentals and resources",
        "Set up learning environment",
        "Complete beginner concepts",
        "Build first project",
        "Practice intermediate topics",
        "Create portfolio project",
    ],
    "fitness": [
        "Assess current fitness level",
        "Create workout plan",
        "Establish routine (weeks 1-2)",
        "Increase intensity (weeks 3-6)",
        "Track progress and adjust",
        "Achieve target milestone",
    ],
    "career": [
        "Define career goals",
        "Update resume and LinkedIn",
        "Skill gap analysis",
        "Complete key certifications",
        "Network and apply",
        "Interview preparation",
    ],
    "business": [
        "Validate business idea",
        "Create business plan",
        "Build MVP",
        "Get first customers",
        "Iterate based on feedback",
        "Scale operations",
    ],
    "creative": [
        "Define creative vision",
        "Gather inspiration and tools",
        "Learn core techniques",
        "Create first piece",
        "Develop unique style",
        "Share with audience",
    ],
    "health": [
        "Health assessment",
        "Set specific targets",
        "Implement diet changes",
        "Add exercise routine",
        "Monitor and adjust",
        "Maintain new habits",
    ],
    "finance": [
        "Track current finances",
        "Set budget system",
        "Build emergency fund",
        "Pay down high-interest debt",
        "Start investing",
        "Review and optimize",
    ],
    "tech": [
        "Learn fundamentals",
        "Set up development environment",
        "Build simple projects",
        "Learn frameworks/tools",
        "Create portfolio project",
        "Deploy and document",
    ],
    "general": [
        "Define success criteria",
        "Break into phases",
        "Start with quick wins",
        "Build momentum",
        "Overcome obstacles",
        "Complete and review",
    ],
}


def generate_roadmap(intent_data: Dict) -> List[Dict]:
    category = intent_data.get("category", "general")
    timeframe = intent_data.get("timeframe", {})
    days = timeframe.get("days", 90)

    template = ROADMAP_TEMPLATES.get(category, ROADMAP_TEMPLATES["general"])
    milestones = template[:6]

    now = datetime.utcnow()
    days_per_milestone = days // len(milestones)

    return [
        {
            "order": i,
            "title": milestone,
            "target_date": (
                now + timedelta(days=days_per_milestone * (i + 1))
            ).isoformat(),
            "status": "pending",
        }
        for i, milestone in enumerate(milestones)
    ]

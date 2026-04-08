import re
from typing import Dict, List

TIME_PATTERNS = {
    r"(\d+)\s*(day|days)": ("days", 1),
    r"(\d+)\s*(week|weeks)": ("weeks", 7),
    r"(\d+)\s*(month|months)": ("months", 30),
    r"(\d+)\s*(year|years)": ("years", 365),
}

CATEGORY_KEYWORDS = {
    "learning": ["learn", "study", "course", "skill", "master", "understand"],
    "fitness": ["fitness", "workout", "exercise", "gym", "run", "weight"],
    "career": ["job", "career", "promotion", "salary", "interview", "resume"],
    "business": ["business", "startup", "company", "product", "sales", "revenue"],
    "creative": ["art", "design", "music", "write", "paint", "create"],
    "health": ["health", "diet", "nutrition", "sleep", "meditation", "mental"],
    "finance": ["save", "invest", "budget", "money", "debt", "financial"],
    "tech": ["coding", "programming", "app", "website", "software", "development"],
}


def extract_timeframe(intent: str) -> Dict:
    intent_lower = intent.lower()
    for pattern, (unit, multiplier) in TIME_PATTERNS.items():
        match = re.search(pattern, intent_lower)
        if match:
            amount = int(match.group(1))
            days = amount * multiplier
            return {"amount": amount, "unit": unit, "days": days}
    return {"amount": 3, "unit": "months", "days": 90}


def detect_category(intent: str) -> str:
    intent_lower = intent.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] = sum(1 for kw in keywords if kw in intent_lower)
    return max(scores, key=scores.get) if any(scores.values()) else "general"


def detect_intent(intent: str) -> Dict:
    intent = intent.strip()[:500]
    if not intent:
        raise ValueError("Intent cannot be empty")

    category = detect_category(intent)
    timeframe = extract_timeframe(intent)

    return {
        "category": category,
        "timeframe": timeframe,
        "complexity": "medium",
        "text": intent,
    }

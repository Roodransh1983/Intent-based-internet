ROADMAP_PROMPT = """JSON only:
{"category":"learning|fitness|career|business|creative|health|finance|tech|general","milestones":[{"order":0,"title":"str","target_days":15}]}
Goal: {intent}
Max 6 milestones. No extra text."""

TASKS_PROMPT = """JSON only:
{"tasks":[{"order":0,"title":"str","description":"str","estimated_days":3}]}
Milestone: {milestone}
2-4 tasks. No extra text."""


def build_roadmap_prompt(intent: str) -> str:
    return ROADMAP_PROMPT.format(intent=intent[:200].strip())


def build_tasks_prompt(milestone_title: str, category: str) -> str:
    return TASKS_PROMPT.format(milestone=milestone_title[:50])

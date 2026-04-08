from typing import Dict, List, Optional
from datetime import datetime, timedelta
from ai.ollama_client import generate_with_ollama
from ai.prompts import build_roadmap_prompt, build_tasks_prompt
from ai.fallback import generate_with_fallback
from ai.cache import get_ai_response, cache_ai_response


async def process_intent_with_ai(intent_text: str) -> Dict:
    try:
        from ai.intent import detect_intent

        intent_data = detect_intent(intent_text)

        cached = get_ai_response(intent_text)
        if cached:
            cached["cached"] = True
            return cached

        roadmap_prompt = build_roadmap_prompt(intent_text)
        ai_result = await generate_with_ollama(roadmap_prompt)

        if ai_result and "milestones" in ai_result:
            milestones = ai_result["milestones"][:6]
            now = datetime.utcnow()

            for i, m in enumerate(milestones):
                m["order"] = i
                m["target_date"] = (
                    now + timedelta(days=m.get("target_days", 15) * (i + 1))
                ).isoformat()
                m["status"] = "pending"

            tasks_by_milestone = {}
            for m in milestones:
                task_prompt = build_tasks_prompt(
                    m["title"], intent_data.get("category", "general")
                )
                task_result = await generate_with_ollama(task_prompt)

                if task_result and "tasks" in task_result:
                    tasks_by_milestone[m["order"]] = task_result["tasks"][:4]
                else:
                    from ai.fallback import fallback_tasks

                    tasks_by_milestone[m["order"]] = fallback_tasks(
                        m["order"], m["title"]
                    )

            result = {
                "intent": intent_data,
                "roadmap": milestones,
                "tasks": tasks_by_milestone,
                "used_fallback": False,
                "used_ai": True,
                "cached": False,
            }

            cache_ai_response(intent_text, result)
            return result

        return generate_with_fallback({"text": intent_text})

    except Exception as e:
        return generate_with_fallback({"text": intent_text})


def validate_roadmap(roadmap: List[Dict]) -> bool:
    if not roadmap or not isinstance(roadmap, list):
        return False
    if len(roadmap) > 6:
        return False
    for m in roadmap:
        if not all(k in m for k in ["order", "title"]):
            return False
    return True


def validate_tasks(tasks: Dict[str, List]) -> bool:
    if not tasks or not isinstance(tasks, dict):
        return False
    for milestone_tasks in tasks.values():
        if not isinstance(milestone_tasks, list):
            return False
        for t in milestone_tasks:
            if not all(k in t for k in ["title"]):
                return False
    return True

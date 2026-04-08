import json
import httpx
from typing import Optional, Dict, Any

OLLAMA_BASE = "http://localhost:11434"
PRIMARY_MODEL = "qwen2.5:1.5b"
FALLBACK_MODEL = "tinyllama"


async def call_ollama(
    prompt: str, model: str = PRIMARY_MODEL
) -> Optional[Dict[str, Any]]:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.3, "top_p": 0.8, "num_predict": 512},
                },
            )

            if response.status_code == 200:
                return response.json()
            return None
    except Exception:
        return None


def parse_json_response(text: str) -> Optional[Dict[str, Any]]:
    try:
        text = text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except (json.JSONDecodeError, IndexError):
        return None


async def generate_with_ollama(
    prompt: str, max_retries: int = 1
) -> Optional[Dict[str, Any]]:
    for attempt in range(max_retries + 1):
        response = await call_ollama(prompt, PRIMARY_MODEL)
        if response:
            result = parse_json_response(response.get("response", ""))
            if result:
                return result

    fallback_response = await call_ollama(prompt, FALLBACK_MODEL)
    if fallback_response:
        result = parse_json_response(fallback_response.get("response", ""))
        if result:
            return result

    return None

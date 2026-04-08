from routes.auth import router as auth_router
from routes.goals import router as goals_router
from routes.tasks import router as tasks_router
from routes.sync import router as sync_router

__all__ = ["auth_router", "goals_router", "tasks_router", "sync_router"]

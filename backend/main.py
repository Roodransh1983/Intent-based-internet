from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import connect_db, is_connected
from database.init import setup_database
from routes.auth import router as auth_router
from routes.goals import router as goals_router
from routes.tasks import router as tasks_router
from routes.sync import router as sync_router
from routes.analytics import router as analytics_router
from datetime import datetime

app = FastAPI(title="Intent-Based Internet")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    connected = connect_db()
    if connected:
        setup_database()
    print(f"MongoDB connected: {connected}")


app.include_router(auth_router)
app.include_router(goals_router, prefix="/goals", tags=["goals"])
app.include_router(tasks_router, tags=["tasks"])
app.include_router(sync_router, tags=["sync"])
app.include_router(analytics_router, tags=["analytics"])


@app.get("/")
async def root():
    return {
        "message": "Intent-Based Internet API",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": False, "db_connected": is_connected()}

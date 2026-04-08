from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class GoalCreate(BaseModel):
    intent: str


class Goal(BaseModel):
    id: str
    user_id: str
    intent: str
    status: str = "active"
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    milestone_id: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class Task(BaseModel):
    id: str
    user_id: str
    goal_id: str
    milestone_id: str
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime


class SyncAction(BaseModel):
    action_type: str
    collection: str
    data: dict
    timestamp: datetime

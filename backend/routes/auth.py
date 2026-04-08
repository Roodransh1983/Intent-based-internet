from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from config import get_db
from models import UserCreate, UserLogin
from auth import hash_password, verify_password, create_token
from database.schemas import user_schema
from routes.deps import get_current_user

router = APIRouter(tags=["auth"])


@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    existing = db.users.find_one({"email": user.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")

    user_doc = user_schema(user.email.lower(), user.name, hash_password(user.password))
    result = db.users.insert_one(user_doc)

    return {"message": "User created", "user_id": str(result.inserted_id)}


@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")

    user_doc = db.users.find_one({"email": user.email.lower()})
    if not user_doc or not verify_password(user.password, user_doc["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    db.users.update_one(
        {"_id": user_doc["_id"]}, {"$set": {"last_login": datetime.utcnow()}}
    )

    token = create_token(str(user_doc["_id"]))
    return {"token": token, "user_id": str(user_doc["_id"])}


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        raise HTTPException(503, "Database unavailable")
    user_doc = db.users.find_one({"_id": ObjectId(user["id"])})
    if not user_doc:
        raise HTTPException(404, "User not found")
    return {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "name": user_doc["name"],
    }

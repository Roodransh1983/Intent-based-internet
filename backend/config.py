from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "intent_net"

client = None
db = None


def connect_db():
    global client, db
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        db = client[DB_NAME]
        return True
    except ConnectionFailure:
        return False


def get_db():
    if db is None:
        connect_db()
    return db


def is_connected():
    try:
        if client:
            client.admin.command("ping")
            return True
    except:
        pass
    return False

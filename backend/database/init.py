from config import get_db, is_connected
from database.schemas import COLLECTIONS, INDEXES


def init_collections():
    db = get_db()
    if db is None:
        return False

    for collection_name in COLLECTIONS:
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)

    return True


def create_indexes():
    db = get_db()
    if db is None:
        return False

    for collection_name, indexes in INDEXES.items():
        collection = db[collection_name]
        for index_field, order in indexes:
            collection.create_index([(index_field, order)])

    return True


def setup_database():
    if not is_connected():
        return False

    init_collections()
    create_indexes()
    return True

import { DB_NAME, SCHEMA_VERSION, COLLECTIONS } from './schema.js';

const STORES = [
  { name: COLLECTIONS.USERS, keyPath: 'id', indexes: ['email', 'user_id'] },
  { name: COLLECTIONS.GOALS, keyPath: 'id', indexes: ['user_id', 'status', 'created_at'] },
  { name: COLLECTIONS.MILESTONES, keyPath: 'id', indexes: ['user_id', 'goal_id', 'order'] },
  { name: COLLECTIONS.TASKS, keyPath: 'id', indexes: ['user_id', 'goal_id', 'milestone_id', 'completed'] },
  { name: COLLECTIONS.PROGRESS, keyPath: 'id', indexes: ['user_id', 'goal_id'] },
  { name: COLLECTIONS.SYNC_QUEUE, keyPath: 'id', indexes: ['timestamp', 'synced'] }
];

let db = null;

export async function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, SCHEMA_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      STORES.forEach((storeConfig) => {
        if (!database.objectStoreNames.contains(storeConfig.name)) {
          const store = database.createObjectStore(storeConfig.name, { keyPath: storeConfig.keyPath });
          storeConfig.indexes.forEach((index) => {
            store.createIndex(index, index, { unique: false });
          });
        }
      });
    };
  });
}

export async function add(collection, data) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get(collection, key) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readonly');
    const store = tx.objectStore(collection);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex(collection, indexName, value) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readonly');
    const store = tx.objectStore(collection);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAll(collection) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readonly');
    const store = tx.objectStore(collection);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function update(collection, data) {
  const database = db || await initDB();
  data.updated_at = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(collection, key) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function query(collection, indexName, value) {
  const database = db || await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(collection, 'readonly');
    const store = tx.objectStore(collection);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addToSyncQueue(action) {
  const syncAction = {
    ...action,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    synced: false,
    attempts: 0
  };
  return add(COLLECTIONS.SYNC_QUEUE, syncAction);
}

export async function getPendingSyncActions() {
  return getAll(COLLECTIONS.SYNC_QUEUE);
}

export async function markSynced(id) {
  const item = await get(COLLECTIONS.SYNC_QUEUE, id);
  if (item) {
    item.synced = true;
    return update(COLLECTIONS.SYNC_QUEUE, item);
  }
}

export async function removeSynced() {
  const items = await getAll(COLLECTIONS.SYNC_QUEUE);
  const synced = items.filter(i => i.synced);
  for (const item of synced) {
    await remove(COLLECTIONS.SYNC_QUEUE, item.id);
  }
  return synced.length;
}

import { getPendingActions, markSynced, markAttempted } from './queue.js';

const BASE_URL = 'http://localhost:8000';

export async function syncPending() {
  const token = localStorage.getItem('token');
  if (!token) return { processed: 0 };
  
  const pending = getPendingActions();
  if (pending.length === 0) return { processed: 0 };
  
  const batch = pending.map(item => ({
    action_type: item.type,
    endpoint: item.endpoint,
    method: item.method,
    data: item.data,
    timestamp: item.timestamp
  }));
  
  try {
    const res = await fetch(`${BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(batch)
    });
    
    if (res.ok) {
      pending.forEach(item => markSynced(item.id));
      return { processed: pending.length };
    } else {
      pending.forEach(item => markAttempted(item.id));
      return { failed: pending.length };
    }
  } catch (err) {
    pending.forEach(item => markAttempted(item.id));
    return { failed: pending.length };
  }
}

export function scheduleSync() {
  setInterval(() => {
    if (navigator.onLine) {
      syncPending();
    }
  }, 30000);
}

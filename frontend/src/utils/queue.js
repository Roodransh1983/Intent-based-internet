const QUEUE_KEY = 'intent_net_queue_v2';

export function getQueue() {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToQueue(action) {
  const queue = getQueue();
  const item = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type: action.type,
    endpoint: action.endpoint,
    method: action.method || 'POST',
    data: action.data,
    timestamp: new Date().toISOString(),
    attempts: 0,
    synced: false
  };
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  triggerSync();
  return item.id;
}

export function removeFromQueue(id) {
  const queue = getQueue().filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingActions() {
  return getQueue().filter(item => !item.synced && item.attempts < 3);
}

export function markAttempted(id) {
  const queue = getQueue();
  const item = queue.find(i => i.id === id);
  if (item) {
    item.attempts += 1;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

export function markSynced(id) {
  const queue = getQueue().filter(item => item.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getQueueLength() {
  return getQueue().length;
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function triggerSync() {
  if ('serviceWorker' in navigator && 'sync' in window.registration) {
    navigator.serviceWorker.ready.then(reg => {
      reg.sync.register('sync-data').catch(() => {});
    });
  }
}

export async function processQueue(apiBaseUrl, token) {
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
    const response = await fetch(`${apiBaseUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(batch)
    });
    
    if (response.ok) {
      pending.forEach(item => markSynced(item.id));
      return { processed: pending.length };
    } else {
      pending.forEach(item => markAttempted(item.id));
      return { processed: 0, failed: pending.length };
    }
  } catch (err) {
    pending.forEach(item => markAttempted(item.id));
    return { processed: 0, failed: pending.length };
  }
}

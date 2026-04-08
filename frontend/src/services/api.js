import { isOnline } from '../utils/connectivity.js';
import { addToQueue } from '../utils/queue.js';


const BASE_URL = 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  if (!isOnline() && config.method !== 'GET') {
    addToQueue({
      type: 'api',
      endpoint,
      method: config.method,
      data: JSON.parse(config.body || '{}')
    });
    throw new Error('OFFLINE_QUEUED');
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  
  return response.json();
}

export async function healthCheck() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export const auth = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/login', { method: 'POST', body: JSON.stringify(data) })
};

export const goals = {
  create: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => request('/goals'),
  getById: (id) => request(`/goals/${id}`)
};

export const tasks = {
  getForGoal: (goalId) => request(`/tasks/${goalId}`),
  update: (taskId, data) => request(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) })
};

export const sync = {
  push: (data) => request('/sync', { method: 'POST', body: JSON.stringify(data) })
};

export default request;

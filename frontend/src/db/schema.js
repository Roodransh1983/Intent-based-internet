export const SCHEMA_VERSION = 1;
export const DB_NAME = 'IntentNetDB';

export const COLLECTIONS = {
  USERS: 'users',
  GOALS: 'goals',
  MILESTONES: 'milestones',
  TASKS: 'tasks',
  PROGRESS: 'progress',
  SYNC_QUEUE: 'syncQueue'
};

export function createUser(data) {
  return {
    id: data.id || crypto.randomUUID(),
    email: data.email,
    name: data.name,
    password_hash: data.password_hash,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    last_login: data.last_login || null,
    status: data.status || 'active'
  };
}

export function createGoal(data) {
  return {
    id: data.id || crypto.randomUUID(),
    user_id: data.user_id,
    intent: data.intent,
    category: data.category || 'general',
    status: data.status || 'active',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    archived: data.archived || false,
    archive_date: data.archive_date || null
  };
}

export function createMilestone(data) {
  return {
    id: data.id || crypto.randomUUID(),
    user_id: data.user_id,
    goal_id: data.goal_id,
    order: data.order,
    title: data.title,
    target_date: data.target_date,
    status: data.status || 'pending',
    completed: data.completed || false,
    completed_at: data.completed_at || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };
}

export function createTask(data) {
  return {
    id: data.id || crypto.randomUUID(),
    user_id: data.user_id,
    goal_id: data.goal_id,
    milestone_id: data.milestone_id,
    order: data.order,
    title: data.title,
    description: data.description || '',
    completed: data.completed || false,
    completed_at: data.completed_at || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  };
}

export function createProgress(data) {
  return {
    id: data.id || crypto.randomUUID(),
    user_id: data.user_id,
    goal_id: data.goal_id,
    completed_tasks: data.completed_tasks,
    total_tasks: data.total_tasks,
    completion_rate: data.completed_tasks / Math.max(1, data.total_tasks),
    last_updated: data.last_updated || new Date().toISOString()
  };
}

export function createSyncAction(data) {
  return {
    id: data.id || Date.now().toString(),
    action_type: data.action_type,
    collection: data.collection,
    data: data.data,
    timestamp: data.timestamp || new Date().toISOString(),
    synced: data.synced || false,
    attempts: data.attempts || 0
  };
}

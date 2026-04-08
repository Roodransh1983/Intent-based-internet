const ANALYTICS_KEY = 'intent_net_analytics';

export function getAnalytics() {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : {
      total_goals: 0,
      total_tasks: 0,
      completed_tasks: 0,
      streak_days: 0,
      last_activity: null
    };
  } catch {
    return {
      total_goals: 0,
      total_tasks: 0,
      completed_tasks: 0,
      streak_days: 0,
      last_activity: null
    };
  }
}

export function updateAnalytics(updates) {
  const current = getAnalytics();
  const updated = {
    ...current,
    ...updates,
    last_activity: new Date().toISOString()
  };
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updated));
  return updated;
}

export function trackGoalCreated() {
  const current = getAnalytics();
  return updateAnalytics({ total_goals: current.total_goals + 1 });
}

export function trackTaskCompleted() {
  const current = getAnalytics();
  return updateAnalytics({ 
    completed_tasks: current.completed_tasks + 1,
    total_tasks: current.total_tasks + 1
  });
}

export function calculateStreak() {
  const analytics = getAnalytics();
  if (!analytics.last_activity) return 0;
  
  const last = new Date(analytics.last_activity);
  const now = new Date();
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    return analytics.streak_days + (diffDays === 1 ? 1 : 0);
  }
  return 0;
}

export function getCompletionRate() {
  const analytics = getAnalytics();
  if (analytics.total_tasks === 0) return 0;
  return Math.round((analytics.completed_tasks / analytics.total_tasks) * 100);
}

export async function syncAnalyticsWithServer(token) {
  const analytics = getAnalytics();
  try {
    await fetch('http://localhost:8000/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(analytics)
    });
  } catch (err) {
    console.error('Analytics sync failed');
  }
}

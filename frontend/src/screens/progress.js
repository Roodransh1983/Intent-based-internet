import { ROUTES, navigate } from './router.js';
import { t } from '../utils/i18n.js';
import { getAnalytics, getCompletionRate } from '../utils/analytics.js';

export function renderProgress() {
  return `
    <div class="screen screen-progress">
      <header class="header">
        <h1>${t('progress')}</h1>
        <button id="back-home" class="btn btn-small">← Back</button>
      </header>
      
      <main class="content">
        <div class="progress-summary">
          <h2>${t('overall_progress')}</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value" id="total-goals">0</span>
              <span class="stat-label">${t('total_goals')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="total-tasks">0</span>
              <span class="stat-label">${t('total_tasks')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="completed-tasks">0</span>
              <span class="stat-label">${t('completed')}</span>
            </div>
            <div class="stat-card">
              <span class="stat-value" id="completion-rate">0%</span>
              <span class="stat-label">${t('rate')}</span>
            </div>
          </div>
        </div>
        
        <section class="goals-progress">
          <h2>${t('your_goals')}</h2>
          <div id="goals-progress-list" class="progress-list"></div>
        </section>
      </main>
    </div>
  `;
}

export function initProgress() {
  document.getElementById('back-home').addEventListener('click', () => navigate(ROUTES.HOME));
  loadProgress();
}

async function loadProgress() {
  const token = localStorage.getItem('token');
  const analytics = getAnalytics();
  
  document.getElementById('total-goals').textContent = analytics.total_goals;
  document.getElementById('total-tasks').textContent = analytics.total_tasks;
  document.getElementById('completed-tasks').textContent = analytics.completed_tasks;
  document.getElementById('completion-rate').textContent = `${getCompletionRate()}%`;
  
  try {
    const goalsRes = await fetch('http://localhost:8000/goals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!goalsRes.ok) throw new Error('Failed');
    
    const goals = await goalsRes.json();
    const progressList = document.getElementById('goals-progress-list');
    
    if (goals.length === 0) {
      progressList.innerHTML = '<p class="empty">No goals yet</p>';
      return;
    }
    
    const goalsProgress = [];
    
    for (const goal of goals) {
      const tasksRes = await fetch(`http://localhost:8000/tasks/${goal._id || goal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        const completed = tasks.filter(t => t.completed).length;
        
        goalsProgress.push({
          goal,
          total: tasks.length,
          completed
        });
      }
    }
    
    renderGoalsProgress(goalsProgress);
  } catch (err) {
    document.getElementById('goals-progress-list').innerHTML = `<p class="error">${t('offline')}</p>`;
  }
}

function renderGoalsProgress(goalsProgress) {
  const list = document.getElementById('goals-progress-list');
  
  if (goalsProgress.length === 0) {
    list.innerHTML = '<p class="empty">No progress data</p>';
    return;
  }
  
  list.innerHTML = goalsProgress.map(({ goal, total, completed }) => {
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return `
      <div class="goal-progress-card">
        <h3>${escapeHtml(goal.intent.substring(0, 50))}</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${rate}%"></div>
        </div>
        <p class="progress-text">${completed}/${total} tasks (${rate}%)</p>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

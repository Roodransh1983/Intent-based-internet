import { ROUTES, navigate } from './router.js';
import { isOnline } from '../utils/connectivity.js';
import { getQueueLength } from '../utils/queue.js';
import { t, setLanguage, getLanguage } from '../utils/i18n.js';
import { trackGoalCreated } from '../utils/analytics.js';
import { isSpeechSupported, startVoiceInput } from '../utils/voice.js';

export function renderHome() {
  const lang = getLanguage();
  return `
    <div class="screen screen-home">
      <header class="header">
        <h1>${t('app_title')}</h1>
        <div class="header-actions">
          <span id="connection-status" class="status-indicator"></span>
          <span id="queue-status" class="queue-indicator"></span>
          <button id="lang-toggle" class="btn btn-small">${lang === 'en' ? t('switch_hindi') : t('switch_english')}</button>
          <button id="logout-btn" class="btn btn-small">${t('logout')}</button>
        </div>
      </header>
      
      <nav class="nav-tabs">
        <button class="nav-tab active" data-screen="home">${t('goals')}</button>
        <button class="nav-tab" data-screen="tasks">${t('tasks')}</button>
        <button class="nav-tab" data-screen="progress">${t('progress')}</button>
      </nav>
      
      <main class="content">
        <section class="goal-input-section">
          <h2>${t('goal_input')}</h2>
          <form id="goal-form">
            <div class="input-with-voice">
              <textarea 
                id="goal-intent" 
                name="intent" 
                placeholder="${t('goal_placeholder')}" 
                maxlength="500"
                rows="3"
                required
              ></textarea>
              ${isSpeechSupported() ? '<button type="button" id="voice-btn" class="btn-voice-icon">🎤</button>' : ''}
            </div>
            <button type="submit" class="btn btn-primary">${t('create_goal')}</button>
          </form>
        </section>
        
        <section class="goals-section">
          <h2>${t('your_goals')}</h2>
          <div id="goals-list" class="goals-list"></div>
        </section>
      </main>
    </div>
  `;
}

export function initHome() {
  updateConnectionStatus();
  
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    navigate(ROUTES.LOGIN);
  });
  
  document.getElementById('lang-toggle').addEventListener('click', () => {
    const current = getLanguage();
    setLanguage(current === 'en' ? 'hi' : 'en');
    location.reload();
  });
  
  if (isSpeechSupported()) {
    document.getElementById('voice-btn').addEventListener('click', () => {
      const textarea = document.getElementById('goal-intent');
      startVoiceInput(
        (text) => {
          textarea.value = text;
        },
        (err) => console.error(err)
      );
    });
  }
  
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const screen = e.target.dataset.screen;
      if (screen === 'tasks') navigate(ROUTES.TASKS);
      else if (screen === 'progress') navigate(ROUTES.PROGRESS);
    });
  });
  
  const form = document.getElementById('goal-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const intent = document.getElementById('goal-intent').value.trim();
    if (!intent) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ intent })
      });
      
      if (res.ok) {
        document.getElementById('goal-intent').value = '';
        trackGoalCreated();
        loadGoals();
      } else {
        alert(t('loading'));
      }
    } catch (err) {
      alert(t('offline'));
    }
    
    updateConnectionStatus();
  });
  
  loadGoals();
}

async function loadGoals() {
  const list = document.getElementById('goals-list');
  list.innerHTML = `<p class="loading">${t('loading')}</p>`;
  
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:8000/goals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const goals = await res.json();
      if (goals.length === 0) {
        list.innerHTML = '<p class="empty">No goals yet. Create your first goal above!</p>';
      } else {
        list.innerHTML = goals.map(g => `
          <div class="goal-card" data-goal-id="${g._id || g.id}">
            <h3>${escapeHtml(g.intent)}</h3>
            <p class="goal-meta">Category: ${g.category || 'general'} | Created: ${formatDate(g.created_at)}</p>
          </div>
        `).join('');
      }
    } else {
      list.innerHTML = '<p class="error">Failed to load goals</p>';
    }
  } catch (err) {
    list.innerHTML = `<p class="error">${t('offline')} - ${t('your_goals')}</p>`;
  }
}

function updateConnectionStatus() {
  const status = document.getElementById('connection-status');
  const queue = document.getElementById('queue-status');
  
  if (isOnline()) {
    status.textContent = `🟢 ${t('online')}`;
    status.style.color = '#10b981';
  } else {
    status.textContent = `🔴 ${t('offline')}`;
    status.style.color = '#ef4444';
  }
  
  const count = getQueueLength();
  queue.textContent = count > 0 ? `(${count} pending)` : '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString();
}

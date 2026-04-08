import { ROUTES, navigate } from './router.js';

export function renderTasks() {
  return `
    <div class="screen screen-tasks">
      <header class="header">
        <h1>Tasks</h1>
        <button id="back-home" class="btn btn-small">← Back</button>
      </header>
      
      <main class="content">
        <div class="goal-selector">
          <label for="task-goal-select">Select Goal:</label>
          <select id="task-goal-select"></select>
        </div>
        
        <div id="tasks-list" class="tasks-list"></div>
      </main>
    </div>
  `;
}

export function initTasks() {
  document.getElementById('back-home').addEventListener('click', () => navigate(ROUTES.HOME));
  
  const select = document.getElementById('task-goal-select');
  select.addEventListener('change', (e) => loadTasks(e.target.value));
  
  loadGoals(select);
}

async function loadGoals(selectEl) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:8000/goals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const goals = await res.json();
      if (goals.length === 0) {
        selectEl.innerHTML = '<option>No goals available</option>';
        document.getElementById('tasks-list').innerHTML = '<p>Create a goal first</p>';
        return;
      }
      
      selectEl.innerHTML = goals.map(g => 
        `<option value="${g._id || g.id}">${escapeHtml(g.intent.substring(0, 50))}</option>`
      ).join('');
      
      loadTasks(selectEl.value);
    }
  } catch (err) {
    selectEl.innerHTML = '<option>Offline</option>';
  }
}

async function loadTasks(goalId) {
  const list = document.getElementById('tasks-list');
  list.innerHTML = '<p class="loading">Loading tasks...</p>';
  
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:8000/tasks/${goalId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      const tasks = await res.json();
      if (tasks.length === 0) {
        list.innerHTML = '<p class="empty">No tasks for this goal</p>';
        return;
      }
      
      list.innerHTML = tasks.map(t => `
        <div class="task-card ${t.completed ? 'completed' : ''}" data-task-id="${t._id || t.id}">
          <label class="task-checkbox">
            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask('${t._id || t.id}', this.checked)">
            <span class="task-title">${escapeHtml(t.title)}</span>
          </label>
          ${t.description ? `<p class="task-desc">${escapeHtml(t.description)}</p>` : ''}
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p class="error">Failed to load tasks</p>';
    }
  } catch (err) {
    list.innerHTML = '<p class="error">Offline</p>';
  }
}

window.toggleTask = async (taskId, completed) => {
  const token = localStorage.getItem('token');
  try {
    await fetch(`http://localhost:8000/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    });
  } catch (err) {
    console.error('Failed to update task');
  }
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

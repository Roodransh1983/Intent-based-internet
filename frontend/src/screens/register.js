import { ROUTES, navigate } from './router.js';

export function renderRegister() {
  return `
    <div class="screen screen-register">
      <div class="auth-container">
        <h1>IntentNet</h1>
        <h2>Create Account</h2>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="reg-name">Name</label>
            <input type="text" id="reg-name" name="name" required maxlength="100">
          </div>
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" name="email" required>
          </div>
          <div class="form-group">
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" name="password" required minlength="6">
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
        </form>
        <p class="auth-switch">
          Already have an account? <a href="#" data-navigate="${ROUTES.LOGIN}">Login</a>
        </p>
        <div id="register-message"></div>
      </div>
    </div>
  `;
}

export function initRegister() {
  const form = document.getElementById('register-form');
  const message = document.getElementById('register-message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('reg-name').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: document.getElementById('reg-password').value
    };
    
    if (!data.name || !data.email || !data.password) {
      message.textContent = 'All fields are required';
      message.className = 'message error';
      return;
    }
    
    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        message.textContent = 'Registration successful! Redirecting to login...';
        message.className = 'message success';
        setTimeout(() => navigate(ROUTES.LOGIN), 1500);
      } else {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        message.textContent = err.detail || 'Registration failed';
        message.className = 'message error';
      }
    } catch (err) {
      message.textContent = 'Network error. Are you online?';
      message.className = 'message error';
    }
  });
  
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.navigate);
    });
  });
}

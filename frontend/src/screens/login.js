import { ROUTES, navigate } from './router.js';

export function renderLogin() {
  return `
    <div class="screen screen-login">
      <div class="auth-container">
        <h1>IntentNet</h1>
        <h2>Welcome Back</h2>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="email" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" name="password" required>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p class="auth-switch">
          No account? <a href="#" data-navigate="${ROUTES.REGISTER}">Register</a>
        </p>
        <div id="login-message"></div>
      </div>
    </div>
  `;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value
    };
    
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('token', token);
        navigate(ROUTES.HOME);
      } else {
        const err = await res.json().catch(() => ({ detail: 'Login failed' }));
        message.textContent = err.detail || 'Login failed';
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

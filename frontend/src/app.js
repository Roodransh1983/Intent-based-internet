import { initDB } from './db/indexeddb.js';
import { initRouter, getCurrentRoute, setRouteHandler } from './screens/router.js';
import { ROUTES } from './screens/router.js';

import { renderLogin, initLogin } from './screens/login.js';
import { renderRegister, initRegister } from './screens/register.js';
import { renderHome, initHome } from './screens/home.js';
import { renderTasks, initTasks } from './screens/tasks.js';
import { renderProgress, initProgress } from './screens/progress.js';

const screens = {
  [ROUTES.LOGIN]: { render: renderLogin, init: initLogin },
  [ROUTES.REGISTER]: { render: renderRegister, init: initRegister },
  [ROUTES.HOME]: { render: renderHome, init: initHome },
  [ROUTES.TASKS]: { render: renderTasks, init: initTasks },
  [ROUTES.PROGRESS]: { render: renderProgress, init: initProgress }
};

async function init() {
  await initDB();
  initRouter();
  
  setRouteHandler((route) => {
    const screen = screens[route] || screens[ROUTES.LOGIN];
    document.getElementById('app').innerHTML = screen.render();
    screen.init();
  });
  
  const token = localStorage.getItem('token');
  const initialRoute = token ? ROUTES.HOME : ROUTES.LOGIN;
  
  document.getElementById('app').innerHTML = screens[initialRoute].render();
  screens[initialRoute].init();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'));
  }
}

init();

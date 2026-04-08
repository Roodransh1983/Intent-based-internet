export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/home',
  TASKS: '/tasks',
  PROGRESS: '/progress'
};

let currentRoute = null;
let onRouteChange = null;

export function navigate(route) {
  currentRoute = route;
  if (onRouteChange) onRouteChange(route);
  window.history.pushState({ route }, '', route);
}

export function setRouteHandler(handler) {
  onRouteChange = handler;
}

export function getCurrentRoute() {
  return currentRoute || ROUTES.LOGIN;
}

export function initRouter() {
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.route) {
      currentRoute = e.state.route;
      if (onRouteChange) onRouteChange(currentRoute);
    }
  });
  
  const token = localStorage.getItem('token');
  const path = window.location.pathname;
  
  if (!token && path !== ROUTES.LOGIN && path !== ROUTES.REGISTER) {
    navigate(ROUTES.LOGIN);
  } else if (token && (path === ROUTES.LOGIN || path === ROUTES.REGISTER)) {
    navigate(ROUTES.HOME);
  }
}

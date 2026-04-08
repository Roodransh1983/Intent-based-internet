export function isOnline() {
  return navigator.onLine;
}

export function onOnline(callback) {
  window.addEventListener('online', callback);
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
}

export function getConnectionStatus() {
  return {
    online: isOnline(),
    effectiveType: navigator.connection?.effectiveType || 'unknown',
    rtt: navigator.connection?.rtt || null,
    downlink: navigator.connection?.downlink || null
  };
}

// Connectivity helper — isOnline() + osStore integration
import useOsStore from '../store/osStore'

export function isOnline() {
  return navigator.onLine
}

export function subscribeConnectivity() {
  const setOffline = () => useOsStore.getState().setIsOffline(true)
  const setOnline  = () => useOsStore.getState().setIsOffline(false)
  window.addEventListener('offline', setOffline)
  window.addEventListener('online',  setOnline)
  return () => {
    window.removeEventListener('offline', setOffline)
    window.removeEventListener('online',  setOnline)
  }
}

// Database health check and latency probe
export async function checkDatabaseHealth() {
  try {
    const res = await fetch('/api/health')
    if (res.ok) {
      const data = await res.json()
      return { online: true, database: data.database || 'connected', latencyMs: data.latencyMs || 10 }
    }
  } catch (_) {}
  return { online: false, database: 'disconnected', latencyMs: null }
}


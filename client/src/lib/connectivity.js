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

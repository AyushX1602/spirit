import React, { useEffect, useState } from 'react'
import Desktop from './desktop/Desktop'
import BootScreen from './desktop/BootScreen'
import LockScreen from './desktop/LockScreen'
import VoiceController from './input/VoiceController'
import GestureController from './input/GestureController'
import EyeTracker from './input/EyeTracker'
import VisualAlert from './components/VisualAlert'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import Spotlight from './components/Spotlight'
import NotificationCenter from './components/NotificationCenter'
import useOsStore from './store/osStore'
import useWindowStore from './store/windowStore'
import useAccessibility from './hooks/useAccessibility'
import { getDefaultSize } from './config/appConfig'
import { subscribeConnectivity } from './lib/connectivity'

/**
 * SpiritOSApp — The core Spirit OS desktop experience.
 * Powered by Hand Gestures, Eye Tracking (iGesture), and Multilingual AI Voice.
 */
function SpiritOSApp() {
  useAccessibility()

  useEffect(() => {
    const unsubscribe = subscribeConnectivity()
    return unsubscribe
  }, [])

  const {
    gestureEnabled, voiceEnabled, eyeTrackingEnabled,
    firstLaunchDone, markFirstLaunchDone,
    isOffline, voiceEnabled: voiceOn,
    toggleSpotlight,
    addNotification,
    lockScreen, lockOnStartup
  } = useOsStore()
  const openWindow = useWindowStore((s) => s.openWindow)
  const [booted, setBooted] = useState(false)

  // Global Ctrl/Cmd+K -> Spotlight
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        toggleSpotlight()
      }
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault()
        lockScreen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleSpotlight, lockScreen])

  // First-launch onboarding: open Notes once after boot completes
  useEffect(() => {
    if (!booted || firstLaunchDone) return
    const timer = setTimeout(() => {
      openWindow('Notes', 'Notes', getDefaultSize('Notes'))
      markFirstLaunchDone()
    }, 1200)
    return () => clearTimeout(timer)
  }, [booted, firstLaunchDone, markFirstLaunchDone, openWindow])

  return (
    <div className="w-screen h-screen overflow-hidden bg-os-bg-primary">
      {/* Startup boot screen */}
      {!booted && <BootScreen onDone={() => { setBooted(true); if (lockOnStartup) lockScreen() }} />}
      
      <Desktop />

      {/* Voice controller — continuous multilingual speech recognition & smart agent */}
      {voiceEnabled && (
        <ErrorBoundary label="Voice Controller" compact
          onError={(_e, _i, label) => addNotification(`⚠️ ${label} failed — voice disabled`, 'warn')}>
          <VoiceController />
        </ErrorBoundary>
      )}

      {/* Gesture controller — 21-landmark hand tracking */}
      {gestureEnabled && (
        <ErrorBoundary label="Gesture Controller" compact
          onError={(_e, _i, label) => addNotification(`⚠️ ${label} failed — gestures disabled`, 'warn')}>
          <GestureController />
        </ErrorBoundary>
      )}

      {/* Eye tracker — iGesture ocular gaze tracking */}
      {eyeTrackingEnabled && (
        <ErrorBoundary label="Eye Tracker" compact
          onError={(_e, _i, label) => addNotification(`⚠️ ${label} failed — eye tracking disabled`, 'warn')}>
          <EyeTracker />
        </ErrorBoundary>
      )}

      {/* Visual alert overlay */}
      <VisualAlert />

      {/* Offline voice badge */}
      {isOffline && voiceOn && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, pointerEvents: 'none',
          background: 'rgba(0,0,0,0.6)', color: '#fbbf24',
          padding: '4px 12px', borderRadius: 99,
          fontSize: 11, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 6,
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ fontSize: 12 }}>📴</span>
          Offline — local voice
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer />

      {/* Spotlight Command Palette */}
      <Spotlight />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Lock screen overlay */}
      <LockScreen />
    </div>
  )
}

export default SpiritOSApp

// Spirit OS v1.0.0 Production Release runtime initialization

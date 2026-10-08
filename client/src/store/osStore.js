import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { synthSpeak } from '../lib/speechBus'

/**
 * @typedef {'default' | 'elderly' | 'visually-impaired' | 'motor-impaired' | 'beginner'} ProfileName
 * @typedef {'dark' | 'light'} Theme
 * @typedef {'normal' | 'large' | 'xl'} FontSize
 * @typedef {'normal' | 'medium' | 'bold'} FontWeight
 * @typedef {'normal' | 'high'} Contrast
 * @typedef {'normal' | 'large'} CursorSize
 */

/**
 * Profile presets configuration
 */
const PROFILE_PRESETS = {
  default: {
    fontSize: 'normal',
    contrast: 'normal',
    cursorSize: 'normal',
    theme: 'light',
    gestureEnabled: true,
    voiceEnabled: false,
    eyeTrackingEnabled: false,
    ttsEnabled: false,
    visualAlertsEnabled: false,
    animationsReduced: false,
    simplifiedUI: false,
    tooltipsEnabled: false,
    screenReaderHints: false,
    highContrast: false,
    largeTargets: false,
    dwellClick: false,
    keyboardOnly: false,
    stickyKeys: false,
    onboardingEnabled: false,
    contextualHelp: false
  },
  elderly: {
    fontSize: 'xl',
    contrast: 'high',
    cursorSize: 'large',
    theme: 'light',
    gestureEnabled: true,
    voiceEnabled: true,
    eyeTrackingEnabled: false,
    ttsEnabled: true,
    visualAlertsEnabled: false,
    animationsReduced: true,
    simplifiedUI: true,
    tooltipsEnabled: true,
    screenReaderHints: false,
    highContrast: false,
    largeTargets: true,
    dwellClick: false,
    keyboardOnly: false,
    stickyKeys: false,
    onboardingEnabled: false,
    contextualHelp: true
  },
  'visually-impaired': {
    fontSize: 'xl',
    contrast: 'high',
    cursorSize: 'large',
    theme: 'light',
    gestureEnabled: true,
    voiceEnabled: true,
    eyeTrackingEnabled: false,
    ttsEnabled: true,
    visualAlertsEnabled: true,
    animationsReduced: true,
    simplifiedUI: false,
    tooltipsEnabled: true,
    screenReaderHints: true,
    highContrast: true,
    largeTargets: true,
    dwellClick: true,
    keyboardOnly: false,
    stickyKeys: false,
    onboardingEnabled: false,
    contextualHelp: true
  },
  'motor-impaired': {
    fontSize: 'large',
    contrast: 'normal',
    cursorSize: 'large',
    theme: 'light',
    gestureEnabled: true,
    voiceEnabled: true,
    eyeTrackingEnabled: false,
    ttsEnabled: true,
    visualAlertsEnabled: false,
    animationsReduced: false,
    simplifiedUI: false,
    tooltipsEnabled: true,
    screenReaderHints: false,
    highContrast: false,
    largeTargets: true,
    dwellClick: true,
    keyboardOnly: false,
    stickyKeys: true,
    onboardingEnabled: false,
    contextualHelp: true
  },
  beginner: {
    fontSize: 'normal',
    contrast: 'normal',
    cursorSize: 'normal',
    theme: 'light',
    gestureEnabled: true,
    voiceEnabled: true,
    eyeTrackingEnabled: false,
    ttsEnabled: true,
    visualAlertsEnabled: false,
    animationsReduced: false,
    simplifiedUI: true,
    tooltipsEnabled: true,
    screenReaderHints: false,
    highContrast: false,
    largeTargets: false,
    dwellClick: false,
    keyboardOnly: false,
    stickyKeys: false,
    onboardingEnabled: true,
    contextualHelp: true
  }
}

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} message
 * @property {'info' | 'warn' | 'error'} type
 * @property {number} timestamp
 */

const DEFAULT_PINNED_APPS = ['FileExplorer', 'Terminal', 'Calculator', 'Notes', 'Browser', 'Settings', 'Translator']

const useOsStore = create(
  persist(
    (set, get) => ({
      // Theme & Appearance
      theme: 'light',
      wallpaper: 'linear-gradient(135deg, #eef0fb 0%, #dde1f9 50%, #e9e4f5 100%)',
      pinnedApps: DEFAULT_PINNED_APPS,
      fontSize: 'normal',
      fontWeight: 'normal',
      contrast: 'normal',
      cursorSize: 'normal',

      // Accessibility
      profile: 'default',
      soundEnabled: true,

      // Input Methods
      gestureEnabled: false,
      voiceEnabled: false,
      eyeTrackingEnabled: false,
      // Gesture cursor movement (independent of gesture detection)
      gestureCursorEnabled: true,
      // Phase 1.1 — Sign Language
      signLanguageEnabled: false,
      // Phase 1.2 — Path Guidance
      pathGuidanceEnabled: false,

      // Presentation player active (for routing voice/gesture nav events)
      presentationActive: false,

      // Phase 6 — Interactive Reading face-depth zoom
      faceZoomScale: 1.0,

      // First-launch onboarding (auto-opens Welcome tour the very first time)
      firstLaunchDone: false,

      alzheimerPhase: 0,   // 0=disabled, 1–5=severity (Phase 2.5)
      userRole: 'user',    // 'user' | 'caregiver'

      // Phase 3.2 — Multilingual Voice
      voiceLocale: 'en-US',
      // Phase 3 (Sarvam) — prefer Sarvam voice when available
      sarvamPreferred: false,
      sarvamSpeaker: '',          // bulbul:v2 speaker id

      // Phase 3.5 — Connectivity & voice preference
      isOffline: false,
      preferAssistantVoice: true,

      // Phase 4 — Spotlight / Command Palette
      spotlightOpen: false,

      // Iteration 7 — Lock screen
      locked: false,            // transient (not persisted): never boot stuck locked
      lockOnStartup: false,     // persisted preference: show lock screen after boot

      // Phase 4 — Notification Center + DND
      dndEnabled: false,
      notificationHistory: [],   // persisted, capped at 50
      unreadCount: 0,
      notifCenterOpen: false,

      // Phase 4 — Voice Macros
      macros: [],   // [{ id, name, commands: [commandId, ...] }]

      // Accessibility
      ttsEnabled: false,
      visualAlertsEnabled: false,

      // User Info
      userName: 'User',

      // Notifications
      /** @type {Notification[]} */
      notifications: [],

      // Actions
      setTheme: (/** @type {Theme} */ theme) => set({ theme }),
      setWallpaper: (/** @type {string} */ wallpaper) => set({ wallpaper }),
      pinApp: (appKey) => set((state) => state.pinnedApps.includes(appKey) ? {} : { pinnedApps: [...state.pinnedApps, appKey] }),
      unpinApp: (appKey) => set((state) => ({ pinnedApps: state.pinnedApps.filter(a => a !== appKey) })),
      togglePin: (appKey) => set((state) => state.pinnedApps.includes(appKey) ? { pinnedApps: state.pinnedApps.filter(a => a !== appKey) } : { pinnedApps: [...state.pinnedApps, appKey] }),
      setFontSize: (/** @type {FontSize} */ fontSize) => set({ fontSize }),
      setFontWeight: (/** @type {FontWeight} */ fontWeight) => set({ fontWeight }),
      setContrast: (/** @type {Contrast} */ contrast) => set({ contrast }),
      setCursorSize: (/** @type {CursorSize} */ cursorSize) => set({ cursorSize }),

      /**
       * Apply an accessibility profile preset.
       * A5: spread the ENTIRE preset so every flag it defines is applied.
       * Previously only 7 of ~18 fields were passed to set(), silently
       * dropping theme, ttsEnabled, simplifiedUI, largeTargets, dwellClick,
       * stickyKeys, animationsReduced, highContrast, tooltipsEnabled, etc.
       * Also, fontWeight: preset.fontWeight ?? 'normal' always wrote 'normal'
       * because no preset defines fontWeight — now omitted so user's choice is kept.
       */
      applyProfile: (profileName) => {
        const preset = PROFILE_PRESETS[profileName]
        if (!preset) return
        set({ profile: profileName, ...preset })
      },

      toggleGesture: () => set((state) => ({ gestureEnabled: !state.gestureEnabled })),
      setGestureEnabled: (enabled) => set({ gestureEnabled: !!enabled }),
      toggleGestureCursor: () => set((state) => ({ gestureCursorEnabled: !state.gestureCursorEnabled })),
      setGestureCursorEnabled: (enabled) => set({ gestureCursorEnabled: !!enabled }),
      toggleVoice: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      setVoiceEnabled: (enabled) => set({ voiceEnabled: !!enabled }),
      toggleEyeTracking: () => set((state) => ({ eyeTrackingEnabled: !state.eyeTrackingEnabled })),
      setEyeTrackingEnabled: (enabled) => set({ eyeTrackingEnabled: !!enabled }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleTTS: () => set((state) => ({ ttsEnabled: !state.ttsEnabled })),
      setTTSEnabled: (enabled) => set({ ttsEnabled: !!enabled }),
      toggleVisualAlerts: () => set((state) => ({ visualAlertsEnabled: !state.visualAlertsEnabled })),
      setVisualAlertsEnabled: (enabled) => set({ visualAlertsEnabled: !!enabled }),
      setUserName: (/** @type {string} */ name) => set({ userName: name }),
      // Phase 1.1 — Sign Language toggle
      toggleSignLanguage: () => set((state) => ({ signLanguageEnabled: !state.signLanguageEnabled })),
      setSignLanguageEnabled: (enabled) => set({ signLanguageEnabled: !!enabled }),
      // Phase 1.2 — Path Guidance toggle
      togglePathGuidance: () => set((state) => ({ pathGuidanceEnabled: !state.pathGuidanceEnabled })),
      setPathGuidanceEnabled: (enabled) => set({ pathGuidanceEnabled: !!enabled }),

      // Presentation mode flag
      setPresentationActive: (v) => set({ presentationActive: !!v }),

      // Phase 6 — Face-depth zoom setter
      setFaceZoomScale: (scale) => set({ faceZoomScale: Math.max(0.6, Math.min(2.0, scale)) }),

      // First-launch
      markFirstLaunchDone: () => set({ firstLaunchDone: true }),

      setAlzheimerPhase: (phase) => set({ alzheimerPhase: Math.min(5, Math.max(0, phase)) }),
      setUserRole: (role) => set({ userRole: role }),
      // Phase 3.2 — Voice locale setter
      setVoiceLocale: (locale) => set({ voiceLocale: locale }),
      setSarvamPreferred: (v) => set({ sarvamPreferred: !!v }),
      setSarvamSpeaker: (s) => set({ sarvamSpeaker: s || '' }),

      // Phase 3.5 — Connectivity setters
      setIsOffline: (v) => set({ isOffline: !!v }),
      setPreferAssistantVoice: (v) => set({ preferAssistantVoice: !!v }),

      // Phase 4 — Spotlight
      openSpotlight:  () => set({ spotlightOpen: true }),
      closeSpotlight: () => set({ spotlightOpen: false }),
      toggleSpotlight: () => set(s => ({ spotlightOpen: !s.spotlightOpen })),

      // Iteration 7 — Lock screen actions
      lockScreen: () => set({ locked: true }),
      unlockScreen: () => set({ locked: false }),
      setLockOnStartup: (v) => set({ lockOnStartup: !!v }),

      // Phase 4 — Notification Center + DND
      setDndEnabled: (v) => set({ dndEnabled: !!v }),
      toggleDnd: () => set(s => ({ dndEnabled: !s.dndEnabled })),
      openNotifCenter:  () => set({ notifCenterOpen: true, unreadCount: 0 }),
      closeNotifCenter: () => set({ notifCenterOpen: false }),
      markAllRead: () => set({ unreadCount: 0 }),
      clearHistory: () => set({ notificationHistory: [], unreadCount: 0 }),

      // Phase 4 — Macros
      saveMacro: (macro) => set(s => ({
        macros: [...s.macros.filter(m => m.id !== macro.id), macro]
      })),
      deleteMacro: (id) => set(s => ({ macros: s.macros.filter(m => m.id !== id) })),

      /**
       * Add a notification
       * @param {string} message
       * @param {'info' | 'warn' | 'error'} type
       * @param {boolean} skipToast
       */
      addNotification: (message, type = 'info', skipToast = false) => {
        const id = Date.now().toString()
        const entry = { id, message, type, timestamp: Date.now(), read: false }
        const isCritical = type === 'alert' || type === 'error' ||
          message.toLowerCase().includes('sos') || message.toLowerCase().includes('emergency')
        const dnd = get().dndEnabled

        // Always add to history (capped at 50)
        set((state) => ({
          notificationHistory: [entry, ...state.notificationHistory].slice(0, 50),
          unreadCount: state.notifCenterOpen ? state.unreadCount : state.unreadCount + 1,
          // Also keep the live notifications array for current-session toasts
          notifications: [...state.notifications, entry]
        }))

        // Suppress toast pop-up when DND is on, UNLESS it's a critical alert
        if (!dnd || isCritical) {
          // TTS: speak notification aloud if enabled
          if (get().ttsEnabled && window.speechSynthesis) {
            const cleanText = message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, '').trim()
            if (cleanText) {
              // Route through speechBus so notifications share the same de-dupe
              // lock + gender-correct voice as the assistant (no overlap / flip).
              synthSpeak(cleanText, { rate: 1.1 })
            }
          }
        }

        // Trigger visual toast popup via registered showToast if not skipped
        if (!skipToast && useOsStore.showToast) {
          const iconMap = {
            info: 'ℹ️',
            success: '✅',
            warn: '⚠️',
            error: '❌',
            alert: '🚨',
          }
          useOsStore.showToast(message, { type, icon: iconMap[type] || 'ℹ️', skipHistory: true })
        }

        // Auto-dismiss from live array after 5 seconds
        setTimeout(() => {
          get().dismissNotification(id)
        }, 5000)
      },

      /**
       * Dismiss a notification
       * @param {string} id
       */
      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => set({ notifications: [] })
    }),
    {
      name: 'spiritos-storage',
      version: 7,
      migrate(persisted, fromVersion) {
        if (!persisted.state) persisted.state = {}
        if (!['dark', 'light'].includes(persisted.state.theme)) {
          persisted.state.theme = 'light'
        }
        // v5 → v6: add Phase 4 defaults
        if (!persisted.state.notificationHistory) persisted.state.notificationHistory = []
        if (!persisted.state.macros) persisted.state.macros = []
        // v6 → v7: add dock pinned apps
        if (!Array.isArray(persisted.state.pinnedApps)) persisted.state.pinnedApps = DEFAULT_PINNED_APPS
        return persisted
      },
      partialize: (state) => ({
        theme: state.theme,
        wallpaper: state.wallpaper,
        pinnedApps: state.pinnedApps,
        fontSize: state.fontSize,
        fontWeight: state.fontWeight,
        contrast: state.contrast,
        cursorSize: state.cursorSize,
        profile: state.profile,
        userName: state.userName,
        signLanguageEnabled: state.signLanguageEnabled,
        pathGuidanceEnabled: state.pathGuidanceEnabled,
        alzheimerPhase: state.alzheimerPhase,
        userRole: state.userRole,
        voiceLocale: state.voiceLocale,
        sarvamPreferred: state.sarvamPreferred,
        sarvamSpeaker: state.sarvamSpeaker,
        isOffline: state.isOffline,
        preferAssistantVoice: state.preferAssistantVoice,
        gestureEnabled: state.gestureEnabled,
        gestureCursorEnabled: state.gestureCursorEnabled,
        voiceEnabled: state.voiceEnabled,
        eyeTrackingEnabled: state.eyeTrackingEnabled,
        ttsEnabled: state.ttsEnabled,
        visualAlertsEnabled: state.visualAlertsEnabled,
        firstLaunchDone: state.firstLaunchDone,
        lockOnStartup: state.lockOnStartup,
        dndEnabled: state.dndEnabled,
        notificationHistory: state.notificationHistory,
        macros: state.macros,
        // A4/A5: persist all profile flags so applyProfile survives reload
        simplifiedUI: state.simplifiedUI,
        largeTargets: state.largeTargets,
        dwellClick: state.dwellClick,
        stickyKeys: state.stickyKeys,
        screenReaderHints: state.screenReaderHints,
        animationsReduced: state.animationsReduced,
        highContrast: state.highContrast,
        keyboardOnly: state.keyboardOnly,
        tooltipsEnabled: state.tooltipsEnabled,
        contextualHelp: state.contextualHelp,
      })
    }
  )
)

export default useOsStore
export { PROFILE_PRESETS }

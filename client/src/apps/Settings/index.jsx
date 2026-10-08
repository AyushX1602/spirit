import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useOsStore from '../../store/osStore'
import useWindowStore from '../../store/windowStore'
import { PROFILES, getDefaultSize } from '../../config/appConfig'
import { VOICE_LANGUAGES } from '../../config/voiceLanguages'

/**
 * Settings — fully theme-aware. Every surface, border, and text colour
 * comes from CSS variables, so dark/light/high-contrast modes all look
 * deliberate.
 */

const PROFILE_INFO = {
  default: {
    name: 'Default',
    description: 'Standard settings for everyday use.',
    icon: 'bolt'
  },
  elderly: {
    name: 'Elderly Mode',
    description: 'Larger fonts, simpler layout, gentle animations, voice ready.',
    icon: 'elderly'
  },
  'visually-impaired': {
    name: 'Visually Impaired',
    description: 'High contrast, big text, screen reader hints and dwell-click.',
    icon: 'visibility_off'
  },
  'motor-impaired': {
    name: 'Motor Impaired',
    description: 'Large hit-targets, sticky keys, gestures and dwell click.',
    icon: 'switch_access_shortcut'
  },
  beginner: {
    name: 'Beginner',
    description: 'Hides advanced apps, adds tooltips, opens the welcome tour.',
    icon: 'school'
  }
}

const DEFAULT_WALLPAPER = 'linear-gradient(135deg, #eef0fb 0%, #dde1f9 50%, #e9e4f5 100%)'

const WALLPAPERS = [
  { id: 'lavender', label: 'Lavender', css: DEFAULT_WALLPAPER },
  { id: 'aurora', label: 'Aurora',
    css: 'radial-gradient(ellipse at 30% 30%, #c7d2fe, transparent 50%), radial-gradient(ellipse at 70% 70%, #fbcfe8, transparent 60%), #dde1f9' },
  { id: 'midnight', label: 'Midnight',
    css: 'radial-gradient(ellipse at 30% 20%, #4f46e5, transparent 60%), radial-gradient(ellipse at 70% 80%, #db2777, transparent 60%), #0d0d18' },
  { id: 'mint', label: 'Mint',
    css: 'radial-gradient(ellipse at 30% 30%, #99f6e4, transparent 60%), radial-gradient(ellipse at 70% 70%, #fde68a, transparent 60%), #ecfdf5' },
  { id: 'sunset', label: 'Sunset',
    css: 'radial-gradient(ellipse at 30% 30%, #fbbf24, transparent 60%), radial-gradient(ellipse at 70% 70%, #ef4444, transparent 60%), #1f1d2b' },
  { id: 'ocean', label: 'Ocean',
    css: 'radial-gradient(ellipse at 25% 25%, #38bdf8, transparent 55%), radial-gradient(ellipse at 75% 75%, #6366f1, transparent 60%), #0b1120' },
  { id: 'forest', label: 'Forest',
    css: 'radial-gradient(ellipse at 30% 25%, #34d399, transparent 55%), radial-gradient(ellipse at 70% 75%, #a3e635, transparent 55%), #052e2b' },
  { id: 'rose', label: 'Rose',
    css: 'radial-gradient(ellipse at 30% 30%, #fda4af, transparent 55%), radial-gradient(ellipse at 70% 70%, #f0abfc, transparent 60%), #fdf2f8' },
  { id: 'graphite', label: 'Graphite',
    css: 'radial-gradient(ellipse at 30% 20%, #475569, transparent 60%), radial-gradient(ellipse at 70% 80%, #1e293b, transparent 60%), #0f172a' }
]

function TabButton({ id, label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors w-full
        ${active
          ? 'bg-os-accent/15 text-os-accent border border-os-accent/30 font-medium'
          : 'text-os-text-secondary surface-hover border border-transparent'}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="text-[14px]">{label}</span>
    </button>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-bd surface-1 p-5 ${className}`}>
      {children}
    </div>
  )
}

function ChoiceCard({ active, onClick, icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 text-left transition-all w-full
        ${active
          ? 'border-os-accent bg-os-accent/10 shadow-glow'
          : 'border-bd surface-1 surface-hover'}`}
    >
      <span className="material-symbols-outlined text-[24px] text-os-accent block mb-2"
        style={{ fontVariationSettings: active ? "'FILL' 1" : '' }}>
        {icon}
      </span>
      <p className="font-medium text-fg">{title}</p>
      {subtitle && <p className="text-[12px] text-fg-mut mt-0.5">{subtitle}</p>}
    </button>
  )
}

function Switch({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent"
      style={{
        width: 48,
        height: 28,
        background: checked ? 'var(--accent)' : '#9ca3af'
      }}
    >
      <span
        className="absolute top-[3px] rounded-full bg-white shadow-md transition-transform duration-200"
        style={{
          width: 22,
          height: 22,
          left: 3,
          transform: checked ? 'translateX(20px)' : 'translateX(0px)'
        }}
      />
    </button>
  )
}

export default function Settings() {
  const [tab, setTab] = useState('appearance')
  const [signModelAvailable, setSignModelAvailable] = useState(null) // null=checking
  const osStore = useOsStore()
  const openWindow = useWindowStore((s) => s.openWindow)
  const {
    theme, fontSize, fontWeight, profile,
    contrast,
    gestureEnabled, voiceEnabled, eyeTrackingEnabled, ttsEnabled, visualAlertsEnabled,
    signLanguageEnabled, pathGuidanceEnabled,
    alzheimerPhase,
    voiceLocale, sarvamPreferred, sarvamSpeaker,
    isOffline, preferAssistantVoice
  } = osStore

  const tabs = [
    { id: 'appearance',    label: 'Appearance',     icon: 'palette' },
    { id: 'accessibility', label: 'Accessibility',  icon: 'accessibility_new' },
    { id: 'input',         label: 'Input methods',  icon: 'keyboard' },
    { id: 'shortcuts',     label: 'Quick shortcuts',icon: 'rocket_launch' },
    { id: 'about',         label: 'About SpiritOS', icon: 'info' }
  ]

  const openApp = (key) => {
    openWindow(key, key, getDefaultSize(key))
  }

  // ── Custom wallpaper upload (from this computer) ──────────────────────────
  const wallpaperInputRef = useRef(null)
  const [wallpaperError, setWallpaperError] = useState('')
  const isCustomWallpaper =
    typeof osStore.wallpaper === 'string' && osStore.wallpaper.trim().startsWith('url(')

  const handleWallpaperFile = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    setWallpaperError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setWallpaperError('Please choose an image file (PNG, JPG, etc.).')
      return
    }
    const reader = new FileReader()
    reader.onerror = () => setWallpaperError('Could not read that file.')
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => setWallpaperError('That image could not be loaded.')
      img.onload = () => {
        // Downscale large photos so the data URL stays small enough to persist
        // in localStorage (and to keep the desktop paint fast).
        const MAX = 1920
        let w = img.naturalWidth || img.width
        let h = img.naturalHeight || img.height
        if (w > MAX || h > MAX) {
          const s = Math.min(MAX / w, MAX / h)
          w = Math.round(w * s)
          h = Math.round(h * s)
        }
        let out = reader.result
        try {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          out = canvas.toDataURL('image/jpeg', 0.82)
        } catch (_) { /* fall back to the original data URL */ }
        try {
          osStore.setWallpaper(`url("${out}") center / cover no-repeat`)
        } catch (_) {
          setWallpaperError('That image is too large to save. Try a smaller one.')
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  // Probe for sign language model on mount — disable toggle if absent
  useEffect(() => {
    fetch('/sign_model/model.json', { method: 'HEAD' })
      .then(r => setSignModelAvailable(r.ok))
      .catch(() => setSignModelAvailable(false))
  }, [])

  return (
    <div className="h-full flex bg-os-bg-primary">
      {/* Sidebar */}
      <aside className="w-60 border-r border-bd surface-1 flex flex-col p-4 overflow-y-auto">
        <div className="text-[11px] font-semibold text-fg-mut uppercase tracking-widest mb-2 px-2">System</div>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => (
            <TabButton key={t.id} {...t} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </nav>
      </aside>

      {/* Detail */}
      <section className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-8 max-w-3xl"
            >
              <header>
                <h1 className="text-2xl font-semibold text-fg">Appearance</h1>
                <p className="text-fg-mut">Make SpiritOS look the way you like it.</p>
              </header>

              {/* Theme */}
              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  <ChoiceCard active={theme === 'light'} onClick={() => osStore.setTheme('light')}
                    icon="light_mode" title="Light" subtitle="Bright surfaces" />
                  <ChoiceCard active={theme === 'dark'} onClick={() => osStore.setTheme('dark')}
                    icon="dark_mode" title="Dark" subtitle="Easy on the eyes" />
                  <ChoiceCard
                    active={contrast === 'high'}
                    onClick={() => osStore.setContrast(contrast === 'high' ? 'normal' : 'high')}
                    icon="contrast"
                    title="High contrast"
                    subtitle="Black & yellow, max legibility"
                  />
                </div>
              </Card>

              {/* Wallpaper */}
              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Wallpaper</h3>
                <p className="text-[12px] text-fg-mut mb-3 -mt-1">Pick a preset or upload your own image from this computer.</p>
                {wallpaperError && (
                  <p className="text-[12px] text-os-danger mb-3" role="alert">{wallpaperError}</p>
                )}
                <input ref={wallpaperInputRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaperFile} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => wallpaperInputRef.current?.click()}
                    className="h-20 rounded-xl border-2 border-dashed border-bd hover:border-os-accent hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-1 text-fg-mut focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent"
                    title="Upload an image from your computer"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-[22px]">add_photo_alternate</span>
                    <span className="text-[11px] font-medium">Upload</span>
                  </button>
                  {isCustomWallpaper && (
                    <div className="h-20 rounded-xl border-2 border-os-accent shadow-glow relative overflow-hidden" style={isCustomWallpaper ? { background: osStore.wallpaper } : undefined}>
                      <button type="button" onClick={() => wallpaperInputRef.current?.click()}
                        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Replace custom wallpaper" />
                      <button type="button" onClick={() => osStore.setWallpaper(DEFAULT_WALLPAPER)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[11px] flex items-center justify-center hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Reset wallpaper to default" title="Reset to default">✕</button>
                      <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-black/45 text-white pointer-events-none">Custom</span>
                    </div>
                  )}
                  {WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => osStore.setWallpaper(wp.css)}
                      className={`h-20 rounded-xl border-2 transition-all
                        ${osStore.wallpaper === wp.css ? 'border-os-accent shadow-glow' : 'border-bd hover:scale-[1.02]'}`}
                      style={{ background: wp.css }}
                      title={wp.label}
                    />
                  ))}
                </div>
              </Card>

              {/* Font size */}
              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Font size</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: 'Normal' },
                    { id: 'large',  label: 'Large' },
                    { id: 'xl',     label: 'Extra large' }
                  ].map((s) => (
                    <ChoiceCard key={s.id}
                      active={fontSize === s.id}
                      onClick={() => osStore.setFontSize(s.id)}
                      icon="format_size"
                      title={s.label} />
                  ))}
                </div>
              </Card>

              {/* Font weight */}
              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Font weight</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'normal', label: 'Regular' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'bold',   label: 'Bold' }
                  ].map((s) => (
                    <ChoiceCard key={s.id}
                      active={fontWeight === s.id}
                      onClick={() => osStore.setFontWeight(s.id)}
                      icon="format_bold"
                      title={s.label} />
                  ))}
                </div>
              </Card>

              {/* Session / Lock screen */}
              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Session</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[14px] text-fg font-medium">Lock on startup</p>
                    <p className="text-[12px] text-fg-mut">Show the lock screen each time SpiritOS starts.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!osStore.lockOnStartup}
                    aria-label="Lock on startup"
                    onClick={() => osStore.setLockOnStartup(!osStore.lockOnStartup)}
                    className={`relative w-12 h-7 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent ${osStore.lockOnStartup ? 'bg-os-accent' : 'bg-bd'}`}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${osStore.lockOnStartup ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => osStore.lockScreen()}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl bg-os-accent/15 text-os-accent text-[13px] font-medium hover:bg-os-accent/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-os-accent flex items-center gap-2"
                  >
                    <span aria-hidden="true">🔒</span> Lock now
                    <kbd className="ml-1 text-[10px] border border-bd rounded px-1 py-0.5 text-fg-mut">⌘⌥L</kbd>
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ACCESSIBILITY */}
          {tab === 'accessibility' && (
            <motion.div
              key="acc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-4xl"
            >
              <header>
                <h1 className="text-2xl font-semibold text-fg">Accessibility profiles</h1>
                <p className="text-fg-mut">Switch the entire OS to suit different needs.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROFILES.map((id) => {
                  const info = PROFILE_INFO[id]
                  const active = profile === id
                  return (
                    <button
                      key={id}
                      onClick={() => osStore.applyProfile(id)}
                      className={`text-left rounded-2xl border-2 p-5 transition-all
                        ${active
                          ? 'border-os-accent bg-os-accent/10 shadow-glow'
                          : 'border-bd surface-1 surface-hover'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-[28px] text-os-accent">
                          {info.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-fg">{info.name}</h3>
                            {active && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-os-accent text-white">ACTIVE</span>
                            )}
                          </div>
                          <p className="text-[13px] text-fg-mut mt-1">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-3">Memory support (Alzheimer aid)</h3>
                <p className="text-[13px] text-fg-mut mb-3">
                  Phase 0 disables this feature. Higher phases enable face recognition reminders
                  and gentle voice prompts. Configure known faces in the Known Book app.
                </p>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((p) => (
                    <button key={p}
                      onClick={() => osStore.setAlzheimerPhase(p)}
                      className={`w-10 h-10 rounded-full border-2 font-medium
                        ${alzheimerPhase === p
                          ? 'bg-os-accent text-white border-os-accent'
                          : 'border-bd text-fg-mut surface-hover'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* INPUT METHODS */}
          {tab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 max-w-3xl"
            >
              <header>
                <h1 className="text-2xl font-semibold text-fg">Input methods</h1>
                <p className="text-fg-mut">Pick how you control SpiritOS.</p>
              </header>

              {[
                { id: 'voice',      label: 'Voice commands',     desc: 'Speak naturally to open apps and ask questions',
                  icon: 'mic',                checked: voiceEnabled,        toggle: 'toggleVoice' },
                { id: 'gesture',    label: 'Hand gestures',      desc: 'MediaPipe + YOLO recognise eight common hand shapes',
                  icon: 'front_hand',         checked: gestureEnabled,      toggle: 'toggleGesture' },
                { id: 'eye',        label: 'Eye tracking',       desc: 'Move the cursor with your gaze (requires calibration)',
                  icon: 'visibility',         checked: eyeTrackingEnabled,  toggle: 'toggleEyeTracking' },
                { id: 'sign',       label: 'Sign language',
                  desc: signModelAvailable === false
                    ? 'Model not installed — coming soon'
                    : 'Detect hand signs as keyboard shortcuts',
                  icon: 'sign_language',
                  checked: signModelAvailable ? signLanguageEnabled : false,
                  toggle: signModelAvailable ? 'toggleSignLanguage' : null,
                  disabled: !signModelAvailable },
                { id: 'tts',        label: 'Text-to-speech',     desc: 'OS reads notifications and slides aloud',
                  icon: 'record_voice_over',  checked: ttsEnabled,          toggle: 'toggleTTS' },
                { id: 'visual',     label: 'Visual alerts',      desc: 'Flash the screen for important notifications',
                  icon: 'notifications_active', checked: visualAlertsEnabled, toggle: 'toggleVisualAlerts' },
                { id: 'path',       label: 'Path guidance',      desc: 'Press space to read the current focus aloud',
                  icon: 'route',              checked: pathGuidanceEnabled, toggle: 'togglePathGuidance' }
              ].map((row) => {
                const isVoiceRow = row.id === 'voice'
                return (
                  <Card key={row.id} className={`!py-3 ${row.disabled ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-os-accent/10 border border-os-accent/30
                                      flex items-center justify-center text-os-accent">
                        <span className="material-symbols-outlined text-[22px]">{row.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-fg">{row.label}</p>
                        <p className="text-[12px] text-fg-mut">{row.desc}</p>
                      </div>
                      <Switch
                        checked={row.checked}
                        onChange={row.disabled ? () => {} : osStore[row.toggle]}
                      />
                    </div>

                    {isVoiceRow && row.checked && (
                      <div className="mt-4 pt-4 border-t border-bd space-y-4">
                        <h4 className="text-[12px] font-semibold uppercase text-fg-mut tracking-wider">
                          🌐 Language &amp; Voice
                        </h4>

                        {/* Offline badge */}
                        {isOffline && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <span className="material-symbols-outlined text-[16px] text-yellow-500">wifi_off</span>
                            <p className="text-[12px] text-yellow-600 dark:text-yellow-400 font-medium">Offline — using local voice only</p>
                          </div>
                        )}

                        {/* Assistant voice preference toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-os-accent">auto_awesome</span>
                            <div>
                              <p className="text-[13px] font-medium text-fg">Assistant voice (AI when online, local fallback offline)</p>
                              <p className="text-[11px] text-fg-mut">Uses Sarvam AI voice when connected; falls back to browser speech offline</p>
                            </div>
                          </div>
                          <Switch
                            checked={!!preferAssistantVoice}
                            onChange={() => osStore.setPreferAssistantVoice(!preferAssistantVoice)}
                          />
                        </div>

                        {/* Language picker */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[12px] text-fg flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">language</span>
                            Language
                          </label>
                          <select
                            value={voiceLocale || 'en-US'}
                            onChange={(e) => osStore.setVoiceLocale(e.target.value)}
                            className="bg-os-bg-primary text-fg border border-bd rounded-lg px-3 py-2 text-sm outline-none focus:border-os-accent"
                          >
                            {VOICE_LANGUAGES.map(language => (
                              <option key={language.locale} value={language.locale}>
                                {language.flag} {language.label} ({language.nativeName})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sarvam preference toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-os-accent">record_voice_over</span>
                            <div>
                              <p className="text-[13px] font-medium text-fg">Prefer Indian voice (Gnani AI)</p>
                              <p className="text-[11px] text-fg-mut">Uses Gnani AI voice when available; falls back to Sarvam/browser speech</p>
                            </div>
                          </div>
                          <Switch
                            checked={!!sarvamPreferred}
                            onChange={() => osStore.setSarvamPreferred(!sarvamPreferred)}
                          />
                        </div>

                        {/* Voice persona (Sarvam speaker) */}
                        {sarvamPreferred && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] text-fg flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">person</span>
                              Voice persona (Bulbul v2)
                            </label>
                            <select
                              value={sarvamSpeaker || ''}
                              onChange={(e) => osStore.setSarvamSpeaker(e.target.value)}
                              className="bg-os-bg-primary text-fg border border-bd rounded-lg px-3 py-2 text-sm outline-none focus:border-os-accent"
                            >
                              <option value="">Default (Auto)</option>
                              <optgroup label="Gnani AI Voices (vachana-voice-v3)">
                                <option value="Pranav">Pranav (Male)</option>
                                <option value="Karan">Karan (Male)</option>
                                <option value="Viraj">Viraj (Male)</option>
                                <option value="Raju">Raju (Male)</option>
                                <option value="Riya">Riya (Female)</option>
                                <option value="Simran">Simran (Female)</option>
                                <option value="Nara">Nara (Female)</option>
                              </optgroup>
                              <optgroup label="Sarvam Female Voices (bulbul:v3)">
                                <option value="priya">Priya</option>
                                <option value="ritu">Ritu</option>
                                <option value="neha">Neha</option>
                                <option value="pooja">Pooja</option>
                                <option value="simran">Simran</option>
                                <option value="kavya">Kavya</option>
                                <option value="ishita">Ishita</option>
                                <option value="shreya">Shreya</option>
                                <option value="tanya">Tanya</option>
                                <option value="shruti">Shruti</option>
                                <option value="suhani">Suhani</option>
                              </optgroup>
                              <optgroup label="Sarvam Male Voices (bulbul:v3)">
                                <option value="shubh">Shubh</option>
                                <option value="aditya">Aditya</option>
                                <option value="rahul">Rahul</option>
                                <option value="rohan">Rohan</option>
                                <option value="amit">Amit</option>
                                <option value="dev">Dev</option>
                                <option value="kabir">Kabir</option>
                                <option value="mani">Mani</option>
                                <option value="mohit">Mohit</option>
                              </optgroup>
                            </select>
                            <p className="text-[10px] text-fg-mut">Select any voice persona for Gnani AI or Sarvam engines.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </motion.div>
          )}

          {/* SHORTCUTS */}
          {tab === 'shortcuts' && (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4 max-w-3xl"
            >
              <header>
                <h1 className="text-2xl font-semibold text-fg">Quick shortcuts</h1>
                <p className="text-fg-mut">Open the apps that make SpiritOS uniquely accessible.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { app: 'Presentation', icon: 'slideshow',          title: 'Presentations',  desc: 'Slide decks for guides, lessons and reminders' },
                  { app: 'Reminders',    icon: 'alarm',              title: 'Reminders',      desc: 'Medications and daily tasks with TTS prompts' },
                  { app: 'Emergency',    icon: 'contact_emergency',  title: 'SOS Contacts',   desc: 'Configure who the red SOS button calls' },
                  { app: 'KnownBook',    icon: 'contacts',           title: 'Known Book',     desc: 'Faces and notes for memory support' },
                  { app: 'Translator',   icon: 'translate',          title: 'Translator',     desc: 'Speak or type, translate to 25 languages' },
                  { app: 'Mail',         icon: 'mail',               title: 'Quick Mail',     desc: 'Compose and send via your default email app' }
                ].map((r) => (
                  <button key={r.app} onClick={() => openApp(r.app)}
                    className="text-left rounded-2xl border border-bd surface-1 surface-hover p-5 flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-xl bg-os-accent/10 border border-os-accent/30
                                    flex items-center justify-center text-os-accent flex-shrink-0">
                      <span className="material-symbols-outlined text-[24px]">{r.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg">{r.title}</p>
                      <p className="text-[12px] text-fg-mut">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ABOUT */}
          {tab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 max-w-3xl"
            >
              <header>
                <h1 className="text-2xl font-semibold text-fg">About SpiritOS</h1>
                <p className="text-fg-mut">A web operating system designed to be usable by everyone.</p>
              </header>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-os-accent flex items-center justify-center shadow-glow">
                    <span className="text-white text-2xl font-bold">S</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-fg">SpiritOS</h3>
                    <p className="text-fg-mut text-[13px]">Version 1.1 · MIT-licensed research project</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-2">What this includes</h3>
                <ul className="space-y-1.5 text-[13px] text-fg">
                  <li>· Multi-modal input: voice, hand gesture, eye tracking, sign language</li>
                  <li>· Five accessibility profiles plus optional Alzheimer support</li>
                  <li>· Real filesystem access via DFS, with a 5-second tree cache</li>
                  <li>· Multi-agent AI (planner → file / system / knowledge / assistant)</li>
                  <li>· Backend persistence with Prisma + SQLite — no static demo data</li>
                </ul>
              </Card>

              <Card>
                <h3 className="text-[12px] uppercase tracking-widest text-fg-mut mb-2">Tech</h3>
                <div className="flex flex-wrap gap-2">
                  {['React 18','Vite','Tailwind','Zustand','Express','Prisma','SQLite','MediaPipe','YOLOv8','TF.js','Anthropic Claude'].map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg surface-1 border border-bd text-[12px] text-fg-mut">{t}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )
}

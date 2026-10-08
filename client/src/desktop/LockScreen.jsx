/**
 * LockScreen — SpiritOS lock / login screen
 *
 * Accessibility-first by design:
 *  - One large, obvious unlock target (no fiddly password by default, so the
 *    OS stays usable for people who struggle with text entry).
 *  - Full keyboard support: Enter / Space / Escape all unlock.
 *  - A polite live-region clock for screen-reader users.
 *  - Respects prefers-reduced-motion (no hover scaling / transitions).
 *  - A dimming scrim guarantees legible text over any wallpaper, light or dark.
 *
 * Shown whenever osStore.locked is true (manual lock, Ctrl/Cmd+Alt+L, the
 * Spotlight "Lock Screen" command, or automatically after boot when the user
 * has enabled "Lock on startup").
 */
import React, { useEffect, useRef, useState } from 'react'
import useOsStore from '../store/osStore'

function greetingFor(date) {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export default function LockScreen() {
  const locked = useOsStore((s) => s.locked)
  const unlockScreen = useOsStore((s) => s.unlockScreen)
  const wallpaper = useOsStore((s) => s.wallpaper)
  const userName = useOsStore((s) => s.userName)

  const [now, setNow] = useState(() => new Date())
  const btnRef = useRef(null)

  // Tick the clock once per second while locked
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [locked])

  // Move focus to the unlock button when the lock screen appears
  useEffect(() => {
    if (!locked) return
    const t = setTimeout(() => btnRef.current && btnRef.current.focus(), 60)
    return () => clearTimeout(t)
  }, [locked])

  // Global keys: Enter / Space / Escape unlock
  useEffect(() => {
    if (!locked) return
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault()
        unlockScreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, unlockScreen])

  if (!locked) return null

  // Apply the same wallpaper as the desktop, whether it is a CSS gradient or an
  // uploaded image stored as a data URL.
  const wp = String(wallpaper || '')
  const isImage = /^(data:|https?:|\/|url\()/.test(wp)
  const bgValue = isImage ? (wp.startsWith('url(') ? wp : 'url(' + wp + ')') : wp
  const rootStyle = isImage
    ? { backgroundImage: bgValue, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: bgValue }

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  const name = (userName || 'User').trim() || 'User'
  const initial = name.charAt(0).toUpperCase() || 'U'
  const greeting = greetingFor(now)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screen locked"
      className="fixed inset-0 z-[200000] flex flex-col items-center justify-center text-white"
      style={rootStyle}
      onClick={unlockScreen}
    >
      {/* Dimming scrim for legibility over any wallpaper */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="relative flex flex-col items-center gap-6 px-8 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Live clock */}
        <div className="text-center" aria-live="polite">
          <div className="text-[88px] leading-none font-extralight tracking-tight drop-shadow-lg tabular-nums">
            {time}
          </div>
          <div className="mt-2 text-lg text-white/85 drop-shadow">{dateStr}</div>
        </div>

        {/* User identity */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="w-24 h-24 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-4xl font-semibold backdrop-blur-md shadow-xl" aria-hidden="true">
            {initial}
          </div>
          <div className="text-center">
            <p className="text-xl font-medium drop-shadow">{greeting}</p>
            <p className="text-base text-white/80 drop-shadow">{name}</p>
          </div>
        </div>

        {/* Unlock control — large accessible target */}
        <button
          ref={btnRef}
          onClick={unlockScreen}
          aria-label="Unlock SpiritOS"
          className="mt-2 px-10 py-4 min-h-[56px] min-w-[200px] rounded-2xl bg-white/90 text-gray-900 text-lg font-semibold shadow-2xl transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          🔓 Unlock
        </button>
        <p className="text-sm text-white/75 drop-shadow" aria-hidden="true">
          Press Enter, click anywhere, or tap Unlock
        </p>
      </div>
    </div>
  )
}

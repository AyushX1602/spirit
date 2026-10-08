import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useWindowStore from '../store/windowStore'
import { getDefaultSize, ICON_STYLES, getAppConfig } from '../config/appConfig'
import { NotificationBell } from '../components/NotificationCenter'
import useOsStore from '../store/osStore'

function Taskbar({ onLauncherClick }) {
  const { windows, openWindow, focusWindow, restoreWindow, minimizeWindow, closeWindow } = useWindowStore()
  const pinnedApps = useOsStore(s => s.pinnedApps) || []
  const togglePin = useOsStore(s => s.togglePin)
  const [menu, setMenu] = useState(null)

  const handleAppClick = (appName) => {
    const existing = windows.find(w => w.app === appName)
    if (existing) {
      if (existing.minimized) restoreWindow(existing.id)
      else if (existing.focused) minimizeWindow(existing.id)
      else focusWindow(existing.id)
    } else {
      openWindow(appName, appName, getDefaultSize(appName))
    }
  }

  const isActive = (appName) => {
    const w = windows.find(w => w.app === appName)
    return w && !w.minimized && w.focused
  }
  const isOpen = (appName) => windows.some(w => w.app === appName)
  const isMinimized = (appName) => {
    const w = windows.find(w => w.app === appName)
    return !!(w && w.minimized)
  }

  // Dock list = pinned apps (in order) + any running app that isn't pinned.
  const runningUnpinned = windows
    .map(w => w.app)
    .filter((a, i, arr) => arr.indexOf(a) === i && !pinnedApps.includes(a))
  const dockApps = [...pinnedApps, ...runningUnpinned].map(key => ({
    app: key,
    name: getAppConfig(key)?.name || key
  }))

  const dockLabel = (app) => {
    const state = isMinimized(app.app) ? 'minimized' : isOpen(app.app) ? 'running' : 'not running'
    const pinnedSuffix = pinnedApps.includes(app.app) ? ', pinned' : ''
    return `${app.name}, ${state}${pinnedSuffix}`
  }

  const handleDockContextMenu = (e, appName) => {
    e.preventDefault()
    setMenu({ app: appName, x: e.clientX, y: e.clientY })
  }
  const closeMenu = () => setMenu(null)
  const handleCloseApp = (appName) => {
    const existing = windows.find(w => w.app === appName)
    if (existing) closeWindow(existing.id)
    closeMenu()
  }
  const menuStyle = menu
    ? { left: Math.min(menu.x, window.innerWidth - 180), bottom: window.innerHeight - menu.y + 8 }
    : null

  return (
    <>
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="dock-pill flex items-center gap-1.5 px-4 h-[60px] rounded-3xl"
      >
        {/* Start / Launcher button */}
        <motion.button
          whileHover={{ scale: 1.12, y: -4 }}
          whileTap={{ scale: 0.92 }}
          onClick={onLauncherClick}
          className="w-[44px] h-[44px] squircle flex items-center justify-center text-white shadow-md mr-1"
          style={{ background: 'linear-gradient(145deg,#6366f1,#4f46e5)' }}
          title="App Launcher"
        >
          <span className="material-symbols-outlined text-[22px]">grid_view</span>
        </motion.button>

        <div className="w-px h-8 mx-0.5" style={{ background: 'var(--border-strong)' }} />

        {/* App dock icons */}
        {dockApps.map((app) => {
          const style = ICON_STYLES[app.app] || { from: '#6b7280', to: '#4b5563', icon: '◻' }
          const active = isActive(app.app)
          const open   = isOpen(app.app)

          return (
            <div key={app.app} className="relative flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.18, y: -6 }}
                whileTap={{ scale: 0.90 }}
                onClick={() => handleAppClick(app.app)}
                onContextMenu={(e) => handleDockContextMenu(e, app.app)}
                aria-label={dockLabel(app)}
                aria-pressed={isActive(app.app)}
                className={`w-[44px] h-[44px] squircle flex items-center justify-center text-white text-[22px] shadow-md transition-all ${
                  active ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-transparent' : ''
                }`}
                style={{ background: `linear-gradient(145deg,${style.from},${style.to})` }}
                title={app.name}
              >
                {style.icon}
              </motion.button>

              {/* Running / focused / minimized indicator */}
              {open && (
                <div className={`absolute -bottom-1.5 rounded-full transition-all ${
                  active
                    ? 'w-4 h-1 bg-os-accent shadow-glow'
                    : isMinimized(app.app)
                      ? 'w-1.5 h-1.5 border border-os-text-muted/70 bg-transparent'
                      : 'w-1 h-1 bg-os-text-muted/60'
                }`} />
              )}
            </div>
          )
        })}

        {/* Notification bell */}
        <div className="w-px h-8 mx-0.5" style={{ background: 'var(--border-strong)' }} />
        <NotificationBell />
      </motion.div>
    </div>

    {menu && (
      <>
        <div
          className="fixed inset-0 z-[300]"
          onClick={closeMenu}
          onContextMenu={(e) => { e.preventDefault(); closeMenu() }}
        />
        <div
          className="fixed z-[301] min-w-[160px] py-1 rounded-xl glass-panel shadow-panel text-[13px] text-os-text"
          style={menuStyle}
          role="menu"
        >
          <button
            role="menuitem"
            onClick={() => { togglePin(menu.app); closeMenu() }}
            className="w-full text-left px-3 py-1.5 hover:bg-os-accent/15 focus-visible:outline-none focus-visible:bg-os-accent/15 flex items-center gap-2"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{pinnedApps.includes(menu.app) ? 'keep_off' : 'keep'}</span>
            {pinnedApps.includes(menu.app) ? 'Unpin from dock' : 'Pin to dock'}
          </button>
          {isOpen(menu.app) && (
            <button
              role="menuitem"
              onClick={() => handleCloseApp(menu.app)}
              className="w-full text-left px-3 py-1.5 hover:bg-os-danger/15 focus-visible:outline-none focus-visible:bg-os-danger/15 flex items-center gap-2 text-os-danger"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">close</span>
              Close
            </button>
          )}
        </div>
      </>
    )}
    </>
  )
}

export default Taskbar
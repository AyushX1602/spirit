/**
 * NotificationCenter.jsx — Phase 4
 *
 * A slide-in panel showing notification history + DND toggle.
 * Opened via the bell icon in the Taskbar or the command palette.
 *
 * DND rules:
 *   - When DND is ON: toasts are suppressed (handled in osStore.addNotification)
 *   - type:'alert' and SOS messages always show regardless of DND
 *   - The Center always records everything regardless
 */

import React, { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useOsStore from '../store/osStore'

const TYPE_STYLE = {
  info:    { icon: 'ℹ️',  color: 'text-blue-400'  },
  success: { icon: '✅',  color: 'text-emerald-400' },
  warn:    { icon: '⚠️',  color: 'text-yellow-400' },
  error:   { icon: '❌',  color: 'text-red-400'    },
  alert:   { icon: '🚨',  color: 'text-red-500'    },
}

function relTime(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function NotificationCenter() {
  const {
    notifCenterOpen, closeNotifCenter,
    notificationHistory, clearHistory, markAllRead,
    dndEnabled, toggleDnd,
    unreadCount
  } = useOsStore()

  const handleClose = useCallback(() => {
    markAllRead()
    closeNotifCenter()
  }, [markAllRead, closeNotifCenter])

  if (!notifCenterOpen) return null

  const grouped = Object.entries(
    (notificationHistory || []).reduce((acc, n) => {
      const type = n.type || 'info'
      if (!acc[type]) acc[type] = []
      acc[type].push(n)
      return acc
    }, {})
  ).sort(([a], [b]) => {
    const order = ['alert','error','warn','success','info']
    return order.indexOf(a) - order.indexOf(b)
  })

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-backdrop/30 z-[180000]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Side panel */}
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed top-0 right-0 h-full w-[340px] z-[180001] flex flex-col glass-window"
        role="complementary"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bd">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🔔</span>
            <h2 className="font-semibold text-fg text-[15px]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-os-accent text-white font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* DND toggle */}
            <button
              onClick={toggleDnd}
              title={dndEnabled ? 'Do Not Disturb ON — click to disable' : 'Enable Do Not Disturb'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                dndEnabled
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  : 'surface-1 text-fg-mut border border-bd hover:text-fg'
              }`}
            >
              <span>{dndEnabled ? '🌙' : '🔔'}</span>
              {dndEnabled ? 'DND on' : 'DND'}
            </button>
            <button onClick={handleClose} aria-label="Close notification center"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-fg-mut hover:text-fg hover:bg-os-surface-hover transition-colors text-[16px]">
              ×
            </button>
          </div>
        </div>

        {/* DND banner */}
        {dndEnabled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
            <span className="text-[13px]">🌙</span>
            <p className="text-[12px] text-yellow-600 dark:text-yellow-400">
              Do Not Disturb is ON — toasts are muted
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-2">
          {(!notificationHistory || notificationHistory.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-fg-mut">
              <span className="text-4xl">🔕</span>
              <p className="text-[13px]">No notifications yet</p>
            </div>
          ) : (
            grouped.map(([type, items]) => {
              const ts = TYPE_STYLE[type] || TYPE_STYLE.info
              return (
                <div key={type} className="mb-2">
                  <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-fg-fnt">
                    {type}
                  </div>
                  {items.map(n => (
                    <div key={n.id}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-os-surface-hover transition-colors">
                      <span className="text-[16px] mt-0.5 flex-shrink-0">{ts.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] ${n.read ? 'text-fg-mut' : 'text-fg'} leading-snug`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-fg-fnt mt-0.5">{relTime(n.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {notificationHistory?.length > 0 && (
          <div className="px-4 py-3 border-t border-bd flex justify-between items-center">
            <span className="text-[11px] text-fg-fnt">{notificationHistory.length} total</span>
            <button
              onClick={clearHistory}
              className="text-[12px] text-fg-mut hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </motion.aside>
    </>,
    document.body
  )
}

/**
 * Bell icon button — renders in the Taskbar.
 */
export function NotificationBell() {
  const { unreadCount, openNotifCenter, dndEnabled } = useOsStore()

  return (
    <motion.button
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.90 }}
      onClick={openNotifCenter}
      title="Notification Center"
      className="relative w-[44px] h-[44px] squircle flex items-center justify-center text-white text-[20px] shadow-md"
      style={{ background: dndEnabled ? 'linear-gradient(145deg,#78716c,#57534e)' : 'linear-gradient(145deg,#6366f1,#4f46e5)' }}
      aria-label={`Notification Center${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      {dndEnabled ? '🌙' : '🔔'}
      {unreadCount > 0 && !dndEnabled && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </motion.button>
  )
}

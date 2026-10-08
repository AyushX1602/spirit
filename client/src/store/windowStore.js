import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { speak } from '../hooks/useTTS'
import useOsStore from './osStore'

// Simple UUID generator (no external dependency)
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Apps that allow multiple instances
const MULTI_INSTANCE_APPS = ['Terminal', 'Notes', 'ImageViewer', 'PdfViewer']

// Insets reserved for the top status area and the bottom dock when snapping.
const SNAP_INSETS = { top: 56, bottom: 96, side: 8, gap: 8 }

// Compute viewport-aware bounds for a snap zone. Returns null if unavailable.
export function getSnapBounds(zone) {
  if (typeof window === 'undefined') return null
  const vw = window.innerWidth
  const vh = window.innerHeight
  const { top, bottom, side, gap } = SNAP_INSETS
  const availW = vw - side * 2
  const availH = vh - top - bottom
  const halfW = (availW - gap) / 2
  const halfH = (availH - gap) / 2
  const leftX = side
  const rightX = side + halfW + gap
  const topY = top
  const bottomY = top + halfH + gap
  switch (zone) {
    case 'left':         return { x: leftX,  y: top,     width: halfW,  height: availH }
    case 'right':        return { x: rightX, y: top,     width: halfW,  height: availH }
    case 'top-left':     return { x: leftX,  y: topY,    width: halfW,  height: halfH }
    case 'top-right':    return { x: rightX, y: topY,    width: halfW,  height: halfH }
    case 'bottom-left':  return { x: leftX,  y: bottomY, width: halfW,  height: halfH }
    case 'bottom-right': return { x: rightX, y: bottomY, width: halfW,  height: halfH }
    case 'full':         return { x: side,   y: top,     width: availW, height: availH }
    default:             return null
  }
}

const useWindowStore = create(
  immer((set, get) => ({
  windows: [],
  topZIndex: 100,

  openWindow: (app, title, defaultSize = { width: 800, height: 600 }, props = {}) => {
    try {
      const state = get()

      // Validate app name
      if (!app || typeof app !== 'string') {
        console.error('[windowStore] Invalid app name:', app)
        return
      }

      // Check if app is already open (for single-instance apps)
      if (!MULTI_INSTANCE_APPS.includes(app)) {
        // W2: match regardless of minimized state — previously `!w.minimized` caused
        // a second window to open when the existing one was minimized.
        const existing = state.windows.find(w => w.app === app)
        if (existing) {
          set((s) => {
            const win = s.windows.find(w => w.id === existing.id)
            if (!win) return
            // Restore if minimized
            win.minimized = false
            // Update props so a new initialUrl / initialDeckId etc. reaches the component;
            // bump navSeq so prop-dependent effects re-fire even if the value looks identical.
            win.props = { ...props, navSeq: (win.props?.navSeq || 0) + 1 }
            const newZ = s.topZIndex + 1
            s.topZIndex = newZ
            s.windows.forEach(w => {
              w.focused = w.id === existing.id
              if (w.id === existing.id) w.zIndex = newZ
            })
          })
          return
        }
      }

      // Create new window
      const id = generateId()
      const newZIndex = state.topZIndex + 1

      const newWindow = {
        id,
        app,
        title,
        x: 100 + (state.windows.length * 30),
        y: 100 + (state.windows.length * 30),
        width: defaultSize?.width || 800,
        height: defaultSize?.height || 600,
        zIndex: newZIndex,
        minimized: false,
        maximized: false,
        snapped: null,
        focused: true,
        props
      }

      console.log('[windowStore] Creating new window:', newWindow)

      // Set all other windows to not focused and update zIndex
      const updatedWindows = state.windows.map(w => ({
        ...w,
        focused: false
      }))

      set({
        windows: [...updatedWindows, newWindow],
        topZIndex: newZIndex
      })

      // Screen reader TTS announcement
      if (useOsStore.getState().ttsEnabled) {
        speak(`Opened ${title}`)
      }
    } catch (err) {
      console.error('[windowStore] openWindow error:', err)
    }
  },

  closeWindow: (id) => {
    try {
      const closing = get().windows.find(w => w.id === id)
      set((state) => ({
        windows: state.windows.filter(w => w.id !== id)
      }))
      // Screen reader TTS announcement
      if (closing && useOsStore.getState().ttsEnabled) {
        speak(`Closed ${closing.title}`)
      }
    } catch (err) {
      console.error('[windowStore] closeWindow error:', err)
    }
  },

  focusWindow: (id) => {
    set((state) => {
      const win = state.windows.find(w => w.id === id)
      if (!win) return state

      const newZIndex = state.topZIndex + 1

      return {
        topZIndex: newZIndex,
        windows: state.windows.map(w => ({
          ...w,
          focused: w.id === id,
          zIndex: w.id === id ? newZIndex : w.zIndex
        }))
      }
    })
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: true, focused: false } : w
      )
    }))
  },

  maximizeWindow: (id) => {
    set((state) => {
      const win = state.windows.find(w => w.id === id)
      if (!win) return state

      // If maximizing (not already maximized), save previous bounds
      if (!win.maximized) {
        return {
          topZIndex: state.topZIndex + 1,
          windows: state.windows.map(w =>
            w.id === id
              ? {
                  ...w,
                  maximized: true,
                  snapped: null,
                  prevBounds: w.snapped ? w.prevBounds : { x: w.x, y: w.y, width: w.width, height: w.height },
                  zIndex: state.topZIndex + 1,
                  focused: true
                }
              : { ...w, focused: false }
          )
        }
      } else {
        // If restoring from maximized, restore previous bounds
        return {
          topZIndex: state.topZIndex + 1,
          windows: state.windows.map(w =>
            w.id === id
              ? {
                  ...w,
                  maximized: false,
                  snapped: null,
                  x: w.prevBounds?.x ?? 100,
                  y: w.prevBounds?.y ?? 100,
                  width: w.prevBounds?.width ?? 800,
                  height: w.prevBounds?.height ?? 600,
                  zIndex: state.topZIndex + 1,
                  focused: true
                }
              : { ...w, focused: false }
          )
        }
      }
    })
  },

  restoreWindow: (id) => {
    set((state) => {
      const win = state.windows.find(w => w.id === id)
      if (!win) return state

      const newZIndex = state.topZIndex + 1

      return {
        topZIndex: newZIndex,
        windows: state.windows.map(w => ({
          ...w,
          minimized: w.id === id ? false : w.minimized,
          focused: w.id === id,
          zIndex: w.id === id ? newZIndex : w.zIndex
        }))
      }
    })
  },

  snapWindow: (id, zone) => {
    const bounds = getSnapBounds(zone)
    if (!bounds) return
    set((state) => {
      const newZ = state.topZIndex + 1
      return {
        topZIndex: newZ,
        windows: state.windows.map(w => {
          if (w.id !== id) return { ...w, focused: false }
          const prevBounds = (!w.snapped && !w.maximized)
            ? { x: w.x, y: w.y, width: w.width, height: w.height }
            : w.prevBounds
          return { ...w, x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, snapped: zone, maximized: false, minimized: false, prevBounds, focused: true, zIndex: newZ }
        })
      }
    })
    const target = get().windows.find(w => w.id === id)
    if (target && useOsStore.getState().ttsEnabled) {
      speak(`Snapped ${target.title} to ${zone.replace('-', ' ')}`)
    }
  },

  restoreBounds: (id) => {
    set((state) => {
      const win = state.windows.find(w => w.id === id)
      if (!win) return state
      const newZ = state.topZIndex + 1
      const pb = win.prevBounds || { x: 100, y: 100, width: 800, height: 600 }
      return {
        topZIndex: newZ,
        windows: state.windows.map(w =>
          w.id === id
            ? { ...w, x: pb.x, y: pb.y, width: pb.width, height: pb.height, snapped: null, maximized: false, focused: true, zIndex: newZ }
            : { ...w, focused: false }
        )
      }
    })
  },

  updatePosition: (id, x, y) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, x, y, snapped: null } : w
      )
    }))
  },

  updateSize: (id, width, height) => {
    set((state) => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, width: Math.max(300, width), height: Math.max(200, height), snapped: null } : w
      )
    }))
  },

  closeAllWindows: () => {
    set({ windows: [] })
  },

  getWindowById: (id) => {
    return get().windows.find(w => w.id === id)
  },

  /**
   * Focus the next window in the list (for gesture swipe right)
   */
  focusNextWindow: () => {
    const state = get()
    const visible = state.windows.filter(w => !w.minimized)
    if (visible.length < 2) return
    const focusedIdx = visible.findIndex(w => w.focused)
    const nextIdx = (focusedIdx + 1) % visible.length
    const next = visible[nextIdx]
    if (next) {
      get().focusWindow(next.id)
      if (useOsStore.getState().ttsEnabled) {
        speak(`Switched to ${next.title}`)
      }
    }
  },

  /**
   * Focus the previous window in the list (for gesture swipe left)
   */
  focusPrevWindow: () => {
    const state = get()
    const visible = state.windows.filter(w => !w.minimized)
    if (visible.length < 2) return
    const focusedIdx = visible.findIndex(w => w.focused)
    const prevIdx = (focusedIdx - 1 + visible.length) % visible.length
    const prev = visible[prevIdx]
    if (prev) {
      get().focusWindow(prev.id)
      if (useOsStore.getState().ttsEnabled) {
        speak(`Switched to ${prev.title}`)
      }
    }
  }
})))

export default useWindowStore

export const useWindowById = (id) => useWindowStore(state => state.windows.find(w => w.id === id))
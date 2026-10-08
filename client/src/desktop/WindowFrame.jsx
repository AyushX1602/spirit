import React, { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore, { getSnapBounds } from '../store/windowStore'
import useOsStore from '../store/osStore'
import { APPS, WINDOW_CONFIG } from '../config/appConfig'
import usePathGuidance from '../hooks/usePathGuidance' // Phase 1.2.2
import ErrorBoundary from '../components/ErrorBoundary'

// App icon mappings
const appIcons = {
  FileExplorer: { icon: 'folder',   filled: true  },
  Terminal:     { icon: 'terminal', filled: false },
  Calculator:   { icon: 'calculate', filled: false },
  Notes:        { icon: 'description', filled: false },
  Browser:      { icon: 'public',   filled: false },
  Settings:     { icon: 'settings', filled: false },
  Translator:   { icon: 'translate', filled: false }
}

// Lazy load app components
const apps = {
  FileExplorer: lazy(() => import('../apps/FileExplorer')),
  Terminal:     lazy(() => import('../apps/Terminal')),
  Calculator:   lazy(() => import('../apps/Calculator')),
  Notes:        lazy(() => import('../apps/Notes')),
  Browser:      lazy(() => import('../apps/Browser')),
  Settings:     lazy(() => import('../apps/Settings')),
  Translator:   lazy(() => import('../apps/Translator'))
}

// Loading component
const AppLoader = () => (
  <div className="flex items-center justify-center h-full text-os-text-secondary">
    Loading...
  </div>
)

/**
 * @param {Object} props
 * @param {import('../store/windowStore').Window} props.windowData
 */
function WindowFrame({ windowData }) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
    snapWindow
  } = useWindowStore()

  const { id, app, title, x, y, width, height, zIndex, minimized, maximized, focused, props } = windowData
  const { addNotification } = useOsStore()

  // Phase 1.2.2 — Path guidance: scope the spacebar reader to this window's DOM.
  // Pass `focused` so only the active window responds to Space — prevents N open
  // windows from each firing their own overlapping screen-reader pass.
  const windowRef = useRef(null)
  const { isReading } = usePathGuidance(windowRef, focused)
  const [snapZone, setSnapZone] = useState(null)

  const AppComponent = useMemo(() => apps[app], [app])
  const appIcon = appIcons[app] || { icon: 'apps', filled: false }

  if (minimized) return null

  const handleClose = (e) => { e.stopPropagation(); closeWindow(id) }
  const handleMinimize = (e) => { e.stopPropagation(); minimizeWindow(id) }
  const handleMaximize = (e) => { e.stopPropagation(); maximizeWindow(id) }
  const handleTitleBarClick = () => { focusWindow(id) }

  // Drag-to-snap: highlight a zone while dragging near a screen edge/corner.
  const SNAP_EDGE = 28
  const handleDrag = (e, d) => {
    const cx = e.clientX
    const cy = e.clientY
    const vw = window.innerWidth
    let zone = null
    if (cy <= SNAP_EDGE) {
      if (cx <= vw * 0.25) zone = 'top-left'
      else if (cx >= vw * 0.75) zone = 'top-right'
      else zone = 'top'
    } else if (cx <= SNAP_EDGE) {
      zone = 'left'
    } else if (cx >= vw - SNAP_EDGE) {
      zone = 'right'
    }
    setSnapZone(prev => (prev === zone ? prev : zone))
  }
  const handleDragStop = (e, d) => {
    if (snapZone === 'top') maximizeWindow(id)
    else if (snapZone) snapWindow(id, snapZone)
    else updatePosition(id, d.x, d.y)
    setSnapZone(null)
  }
  const previewBounds = snapZone === 'top'
    ? getSnapBounds('full')
    : (snapZone ? getSnapBounds(snapZone) : null)
  const snapPreviewStyle = previewBounds
    ? { left: previewBounds.x, top: previewBounds.y, width: previewBounds.width, height: previewBounds.height }
    : null

  // Animation variants
  const openVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.15 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.1 } }
  }

  return (
    <>
      {snapZone && snapPreviewStyle && (
        <div className="fixed z-[12000] pointer-events-none rounded-2xl border-2 border-os-accent bg-os-accent/20 backdrop-blur-sm transition-all duration-100" style={snapPreviewStyle} />
      )}
    <AnimatePresence>
      <Rnd
        className={maximized ? 'window-frame-rnd window-frame-rnd--maximized' : 'window-frame-rnd'}
        size={maximized
          ? { width: '100dvw', height: '100dvh' }
          : { width, height }
        }
        position={maximized ? { x: 0, y: 0 } : { x, y }}
        minWidth={maximized ? 0 : WINDOW_CONFIG.minWidth}
        minHeight={maximized ? 0 : WINDOW_CONFIG.minHeight}
        bounds={maximized ? undefined : "parent"}
        dragHandleClassName="window-drag-handle"
        enableResizing={!maximized}
        disableDragging={maximized}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={(e, direction, ref, delta, position) => {
          updateSize(id, parseInt(ref.style.width), parseInt(ref.style.height))
        }}
        style={{ zIndex: maximized ? Math.max(zIndex, 9999) : zIndex }}
        onMouseDown={() => focusWindow(id)}
      >
        <motion.div
          variants={openVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`h-full flex flex-col glass-window overflow-hidden transition-opacity duration-200 ${
            focused ? 'shadow-window ring-1 ring-white/40' : 'opacity-[0.80] shadow-xl'
          } ${maximized ? 'rounded-none' : 'rounded-2xl'}`}
        >
          {/* TITLE BAR */}
          <div
            className="window-drag-handle h-10 flex items-center px-4 bg-os-surface border-b border-os-border flex-shrink-0 cursor-default select-none"
            onClick={handleTitleBarClick}
            onDoubleClick={handleMaximize}
          >
            {/* Traffic Lights (left, w-16) */}
            <div className="flex items-center gap-2 w-16 group">
              <button onClick={handleClose} aria-label={`Close ${title}`} title="Close" className="w-4 h-4 rounded-full bg-red-500/90 border border-red-400 hover:bg-red-400 transition-colors flex items-center justify-center cursor-pointer shadow-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                <span aria-hidden="true" className="text-[10px] text-red-100 font-bold leading-none select-none opacity-70 hover:opacity-100">✕</span>
              </button>
              <button onClick={handleMinimize} aria-label={`Minimize ${title}`} title="Minimize" className="w-4 h-4 rounded-full bg-yellow-500/90 border border-yellow-400 hover:bg-yellow-400 transition-colors flex items-center justify-center cursor-pointer shadow-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                <span aria-hidden="true" className="text-[10px] text-yellow-900 font-bold leading-none select-none opacity-70 hover:opacity-100">−</span>
              </button>
              <button onClick={handleMaximize} aria-label={`${maximized ? 'Restore' : 'Maximize'} ${title}`} title={maximized ? 'Restore' : 'Maximize'} className="w-4 h-4 rounded-full bg-green-500/90 border border-green-400 hover:bg-green-400 transition-colors flex items-center justify-center cursor-pointer shadow-md hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                <span aria-hidden="true" className="text-[10px] text-green-900 font-bold leading-none select-none opacity-70 hover:opacity-100">✱</span>
              </button>
            </div>

            {/* Centered title */}
            <div className="flex-1 flex justify-center items-center gap-2 text-os-text-primary absolute left-1/2 -translate-x-1/2">
              <span className="material-symbols-outlined text-[16px] text-os-text-muted" style={appIcon.filled ? { fontVariationSettings: "'FILL' 1" } : {}}>{appIcon.icon}</span>
              <span className="text-os-text text-[13px] font-medium tracking-wide">{title}</span>
            </div>

            {/* Spacer (w-16 right) */}
            <div className="w-16"></div>
          </div>

          {/* Window Content */}
          <div ref={windowRef} className="flex-1 overflow-hidden bg-os-bg-primary" style={{ position: 'relative' }}>
            {/* Phase 1.2.2 — visual flash for low-vision spacebar feedback (100ms) */}
            {isReading && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 9999,
                background: 'rgba(255,255,255,0.15)',
                pointerEvents: 'none', borderRadius: 2
              }} />
            )}
            <Suspense fallback={<AppLoader />}>
              <ErrorBoundary
                label={title || app}
                onError={(err, _info, label) =>
                  addNotification(`⚠️ ${label} crashed: ${err?.message || 'unknown error'}`, 'error')
                }
              >
                {AppComponent ? (
                  <AppComponent {...props} />
                ) : (
                  <div className="flex items-center justify-center h-full text-os-text-secondary">
                    App not found: {app}
                  </div>
                )}
              </ErrorBoundary>
            </Suspense>
          </div>
        </motion.div>
      </Rnd>
    </AnimatePresence>
    </>
  )
}

// Memoized so the desktop clock's 1s re-render doesn't re-render every open
// window (and its lazy-loaded app tree); only windows whose data changed update.
export default React.memo(WindowFrame)

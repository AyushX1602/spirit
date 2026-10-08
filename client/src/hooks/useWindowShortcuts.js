import { useEffect } from 'react'
import useWindowStore from '../store/windowStore'

/**
 * Global window-management keyboard shortcuts (Ctrl+Alt leader).
 *
 * Layout-independent (uses e.code, not e.key) so it works on any keyboard
 * layout. This is a core accessibility feature: it lets keyboard-only users
 * (and switch/sticky-key users) tile, maximize, minimize, and cycle windows
 * without a mouse.
 *
 *   Ctrl+Alt+Left/Right  -> snap to left / right half
 *   Ctrl+Alt+Up          -> maximize
 *   Ctrl+Alt+Down        -> restore (if snapped/maximized) else minimize
 *   Ctrl+Alt+1/2/3/4     -> quarter tiles (TL / TR / BL / BR)
 *   Ctrl+Alt+M           -> minimize
 *   Ctrl+Alt+W           -> close
 *   Ctrl+Alt+N / P       -> focus next / previous window
 */
export default function useWindowShortcuts() {
  useEffect(() => {
    const onKeyDown = (e) => {
      // Require exactly Ctrl+Alt (no Meta, no Shift) as the leader chord.
      if (!e.ctrlKey || !e.altKey || e.metaKey || e.shiftKey) return

      const store = useWindowStore.getState()
      const {
        windows, snapWindow, maximizeWindow, minimizeWindow,
        restoreBounds, focusNextWindow, focusPrevWindow, closeWindow
      } = store
      const focused = windows.find(w => w.focused && !w.minimized)

      const needsFocused = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Digit1', 'Digit2', 'Digit3', 'Digit4', 'KeyM', 'KeyW'
      ]
      if (needsFocused.includes(e.code) && !focused) return

      switch (e.code) {
        case 'ArrowLeft':  e.preventDefault(); snapWindow(focused.id, 'left'); break
        case 'ArrowRight': e.preventDefault(); snapWindow(focused.id, 'right'); break
        case 'ArrowUp':    e.preventDefault(); maximizeWindow(focused.id); break
        case 'ArrowDown':
          e.preventDefault()
          if (focused.maximized || focused.snapped) restoreBounds(focused.id)
          else minimizeWindow(focused.id)
          break
        case 'Digit1': e.preventDefault(); snapWindow(focused.id, 'top-left'); break
        case 'Digit2': e.preventDefault(); snapWindow(focused.id, 'top-right'); break
        case 'Digit3': e.preventDefault(); snapWindow(focused.id, 'bottom-left'); break
        case 'Digit4': e.preventDefault(); snapWindow(focused.id, 'bottom-right'); break
        case 'KeyM':   e.preventDefault(); minimizeWindow(focused.id); break
        case 'KeyW':   e.preventDefault(); closeWindow(focused.id); break
        case 'KeyN':   e.preventDefault(); focusNextWindow(); break
        case 'KeyP':   e.preventDefault(); focusPrevWindow(); break
        default: break
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}

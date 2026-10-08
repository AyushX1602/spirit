/**
 * client/src/store/__tests__/windowStore.test.js — T3
 *
 * Tests: single-instance focus, multi-instance second window,
 * maximizeWindow saves prevBounds & restores, updateSize clamps to min 300×200.
 */
import { describe, it, expect, vi } from 'vitest'

// Top-level mocks (hoisting-safe)
vi.mock('../../hooks/useTTS', () => ({ speak: vi.fn() }))
vi.mock('../../store/osStore', () => ({
  default: { getState: () => ({ ttsEnabled: false }) }
}))

async function freshStore() {
  vi.resetModules()
  const mod = await import('../windowStore.js')
  return mod.default
}

describe('windowStore', () => {

  // ── Single-instance app: second open focuses existing window ──────────────
  it('single-instance app focuses existing window, no duplicate created', async () => {
    const useStore = await freshStore()
    useStore.getState().openWindow('Settings', 'Settings', { width: 800, height: 600 })
    expect(useStore.getState().windows).toHaveLength(1)

    useStore.getState().openWindow('Settings', 'Settings', { width: 800, height: 600 })
    expect(useStore.getState().windows).toHaveLength(1)  // still 1
    expect(useStore.getState().windows[0].focused).toBe(true)
  })

  // ── Multi-instance app: second open creates a second window ───────────────
  it('multi-instance app (Terminal) creates a second window', async () => {
    const useStore = await freshStore()
    useStore.getState().openWindow('Terminal', 'Terminal', { width: 700, height: 500 })
    useStore.getState().openWindow('Terminal', 'Terminal', { width: 700, height: 500 })
    expect(useStore.getState().windows).toHaveLength(2)
  })

  it('multi-instance app (Notes) creates a second window', async () => {
    const useStore = await freshStore()
    useStore.getState().openWindow('Notes', 'Notes', { width: 700, height: 500 })
    useStore.getState().openWindow('Notes', 'Notes', { width: 700, height: 500 })
    expect(useStore.getState().windows).toHaveLength(2)
  })

  // ── maximizeWindow saves prevBounds and restores them ────────────────────
  it('maximizeWindow saves prevBounds and restore reverts to them', async () => {
    const useStore = await freshStore()
    useStore.getState().openWindow('Calculator', 'Calculator', { width: 400, height: 300 })
    const [win] = useStore.getState().windows
    expect(win.maximized).toBe(false)

    useStore.getState().maximizeWindow(win.id)
    const maxWin = useStore.getState().windows[0]
    expect(maxWin.maximized).toBe(true)
    expect(maxWin.prevBounds).toMatchObject({ width: 400, height: 300 })

    // Toggle again to restore
    useStore.getState().maximizeWindow(win.id)
    const restored = useStore.getState().windows[0]
    expect(restored.maximized).toBe(false)
    expect(restored.width).toBe(400)
    expect(restored.height).toBe(300)
  })

  // ── updateSize clamps to min 300×200 ─────────────────────────────────────
  it('updateSize clamps width to 300 and height to 200 minimum', async () => {
    const useStore = await freshStore()
    useStore.getState().openWindow('Browser', 'Browser', { width: 800, height: 600 })
    const [win] = useStore.getState().windows

    useStore.getState().updateSize(win.id, 50, 80)
    const updated = useStore.getState().windows[0]
    expect(updated.width).toBe(300)
    expect(updated.height).toBe(200)
  })

})

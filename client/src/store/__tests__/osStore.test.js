/**
 * client/src/store/__tests__/osStore.test.js — T3
 *
 * Tests the Phase 4 DND + notification behavior of the real osStore.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'

// ── Mock browser APIs not in jsdom ────────────────────────────────────────────
global.speechSynthesis = { cancel: vi.fn(), speak: vi.fn() }
global.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(text) { this.text = text; this.rate = 1 }
}

vi.useFakeTimers()

async function freshStore() {
  vi.resetModules()
  const mod = await import('../osStore.js')
  return mod.default
}

describe('osStore — DND + notifications', () => {

  afterEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
    localStorage.clear()
  })

  // ── DND OFF: info notification → TTS speaks ───────────────────────────────
  it('addNotification with DND OFF speaks via TTS for info type', async () => {
    const useStore = await freshStore()
    useStore.getState().setTTSEnabled(true)
    useStore.getState().setDndEnabled(false)
    useStore.getState().addNotification('Hello world', 'info')

    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })

  // ── DND ON: info → TTS suppressed, still recorded in history ─────────────
  it('addNotification with DND ON suppresses TTS for info type', async () => {
    const useStore = await freshStore()
    useStore.getState().setTTSEnabled(true)
    useStore.getState().setDndEnabled(true)
    useStore.getState().addNotification('Muted notice', 'info')

    expect(global.speechSynthesis.speak).not.toHaveBeenCalled()
    // But still recorded in history
    const hist = useStore.getState().notificationHistory
    expect(hist.some(n => n.message === 'Muted notice')).toBe(true)
  })

  // ── DND ON: error type bypasses DND ──────────────────────────────────────
  it('addNotification with DND ON still speaks for error type (critical)', async () => {
    global.speechSynthesis.speak.mockClear()
    const useStore = await freshStore()
    useStore.getState().setTTSEnabled(true)
    useStore.getState().setDndEnabled(true)
    useStore.getState().addNotification('Critical error!', 'error')

    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })

  // ── DND ON: SOS message bypasses DND ─────────────────────────────────────
  it('SOS message bypasses DND regardless of type', async () => {
    global.speechSynthesis.speak.mockClear()
    const useStore = await freshStore()
    useStore.getState().setTTSEnabled(true)
    useStore.getState().setDndEnabled(true)
    useStore.getState().addNotification('SOS triggered!', 'info')

    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })

  // ── history always records, DND or not ────────────────────────────────────
  it('notificationHistory records all notifications regardless of DND', async () => {
    const useStore = await freshStore()
    useStore.getState().setDndEnabled(true)
    useStore.getState().addNotification('A', 'info')
    useStore.getState().addNotification('B', 'info')
    useStore.getState().setDndEnabled(false)
    useStore.getState().addNotification('C', 'info')

    const hist = useStore.getState().notificationHistory
    expect(hist.length).toBe(3)
  })

  // ── unreadCount increments when notifCenter is closed ────────────────────
  it('unreadCount increments when notifCenter is closed', async () => {
    const useStore = await freshStore()
    const before = useStore.getState().unreadCount
    useStore.getState().addNotification('A', 'info')
    expect(useStore.getState().unreadCount).toBe(before + 1)
  })

  // ── unreadCount does NOT increment when notifCenter is open ───────────────
  it('unreadCount does NOT increment when notifCenter is open', async () => {
    const useStore = await freshStore()
    useStore.getState().openNotifCenter()   // resets unreadCount to 0
    const before = useStore.getState().unreadCount
    useStore.getState().addNotification('B', 'info')
    expect(useStore.getState().unreadCount).toBe(before)
  })

  // ── notificationHistory capped at 50 ─────────────────────────────────────
  it('notificationHistory is capped at 50 entries', async () => {
    const useStore = await freshStore()
    for (let i = 0; i < 60; i++) {
      useStore.getState().addNotification(`Msg ${i}`, 'info')
    }
    expect(useStore.getState().notificationHistory.length).toBeLessThanOrEqual(50)
  })

})

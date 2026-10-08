/**
 * client/src/lib/__tests__/commands.test.js — T3
 *
 * Tests the command palette registry in commands.js.
 */
import { describe, it, expect, vi } from 'vitest'

// Mock appConfig since getDefaultSize is used at import time
vi.mock('../../config/appConfig', () => ({
  getDefaultSize: (_app) => ({ width: 800, height: 600 })
}))

import { COMMANDS, filterCommands } from '../commands.js'

describe('commands registry', () => {

  // ── Every command has id, title, run, keywords ────────────────────────────
  it('every command has id, title, run, and at least one keyword', () => {
    for (const cmd of COMMANDS) {
      expect(cmd.id, `${cmd.id} missing id`).toBeTruthy()
      expect(typeof cmd.title).toBe('string')
      expect(typeof cmd.run).toBe('function')
      expect(Array.isArray(cmd.keywords)).toBe(true)
      expect(cmd.keywords.length).toBeGreaterThanOrEqual(1)
    }
  })

  // ── Destructive commands have requiresConfirm: true ───────────────────────
  it('trigger-sos has requiresConfirm: true', () => {
    const sos = COMMANDS.find(c => c.id === 'trigger-sos')
    expect(sos).toBeTruthy()
    expect(sos.requiresConfirm).toBe(true)
  })

  // ── Non-destructive open-vault does NOT requiresConfirm ──────────────────
  it('open-vault does not require confirm (opening is not destructive)', () => {
    const vault = COMMANDS.find(c => c.id === 'open-vault')
    expect(vault).toBeTruthy()
    expect(vault.requiresConfirm).toBeFalsy()
  })

  // ── run() for open-notes calls windowStore.openWindow ────────────────────
  it('open-notes run() calls windowStore.openWindow with Notes', () => {
    const openWindowMock = vi.fn()
    const cmd = COMMANDS.find(c => c.id === 'open-notes')
    expect(cmd).toBeTruthy()
    cmd.run({ windowStore: { openWindow: openWindowMock, windows: [] }, osStore: {} })
    expect(openWindowMock).toHaveBeenCalledWith('Notes', 'Notes', { width: 800, height: 600 })
  })

  // ── open-terminal calls openWindow with Terminal ──────────────────────────
  it('open-terminal run() calls windowStore.openWindow with Terminal', () => {
    const openWindowMock = vi.fn()
    const cmd = COMMANDS.find(c => c.id === 'open-terminal')
    cmd.run({ windowStore: { openWindow: openWindowMock, windows: [] }, osStore: {} })
    expect(openWindowMock).toHaveBeenCalledWith('Terminal', 'Terminal', { width: 800, height: 600 })
  })

  // ── toggle-dnd calls osStore.toggleDnd ───────────────────────────────────
  it('toggle-dnd run() calls osStore.toggleDnd', () => {
    const toggleDndMock = vi.fn()
    const cmd = COMMANDS.find(c => c.id === 'toggle-dnd')
    expect(cmd).toBeTruthy()
    cmd.run({ osStore: { toggleDnd: toggleDndMock } })
    expect(toggleDndMock).toHaveBeenCalled()
  })

  // ── toggle-tts calls osStore.toggleTTS ───────────────────────────────────
  it('toggle-tts run() calls osStore.toggleTTS', () => {
    const toggleTTSMock = vi.fn()
    const cmd = COMMANDS.find(c => c.id === 'toggle-tts')
    expect(cmd).toBeTruthy()
    cmd.run({ osStore: { toggleTTS: toggleTTSMock } })
    expect(toggleTTSMock).toHaveBeenCalled()
  })

  // ── filterCommands returns subset matching query ──────────────────────────
  it('filterCommands("notes") returns open-notes', () => {
    const results = filterCommands('notes')
    expect(results.some(c => c.id === 'open-notes')).toBe(true)
  })

  it('filterCommands("") returns first 12 commands', () => {
    const results = filterCommands('')
    expect(results.length).toBe(Math.min(12, COMMANDS.length))
  })

})

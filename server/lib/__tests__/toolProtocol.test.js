/**
 * server/lib/__tests__/toolProtocol.test.js — T2
 *
 * Unit tests for toolProtocol.js.
 * HARD RULE: imports the real module; does NOT modify it.
 *
 * We inject a fake registry via Node's require.cache. To bypass
 * Windows directory junctions, we resolve and mock both the symlinked
 * and real path.
 */
import { describe, it, expect, vi } from 'vitest'
import path from 'path'
import fs from 'fs'

// Note the explicit .js extension is required for require.cache keys
const irisToolsPath = path.resolve(__dirname, '../irisTools.js')
let realIrisToolsPath = irisToolsPath
try {
  realIrisToolsPath = fs.realpathSync(irisToolsPath)
} catch (_) {}

const mockRegistry = {
  echo:          async (args) => ({ ok: true, message: `echo: ${args.text}` }),
  boom:          async ()     => { throw new Error('handler exploded') },
  nullret:       async ()     => null,
  errobj:        async ()     => ({ error: 'tool_self_reported_error' }),
  needs_confirm: async ()     => ({ requiresConfirmation: true, message: 'Please confirm' }),
  write_file:    async (args) => ({ created: args.file_path }),
}

const mockModule = {
  id: irisToolsPath,
  filename: irisToolsPath,
  loaded: true,
  exports: {
    toolRegistry: mockRegistry,
    toolDeclarations: []
  }
}

// Pre-populate require.cache for both paths
require.cache[irisToolsPath] = mockModule
require.cache[realIrisToolsPath] = mockModule

// Import toolProtocol after cache is pre-populated
const { executeToolCalls, summarizeOutcome } = require('../toolProtocol')

// ─────────────────────────────────────────────────────────────────────────────
function makeReply(name, argsJson) {
  return `[[TOOL_CALL: ${name}, ${argsJson}]]`
}

describe('toolProtocol — executeToolCalls', () => {

  // T2 case 1: multi-marker, both execute in order
  it('executes two markers in order', async () => {
    const reply = `[[TOOL_CALL: echo, {"text":"first"}]] prose [[TOOL_CALL: write_file, {"file_path":"/tmp/a.txt"}]]`
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.calls).toHaveLength(2)
    expect(result.calls[0].tool).toBe('echo')
    expect(result.calls[0].ok).toBe(true)
    expect(result.calls[1].tool).toBe('write_file')
    expect(result.calls[1].ok).toBe(true)
  })

  // T2 case 2: no markers
  it('returns anyCalls=false when no markers found', async () => {
    const result = await executeToolCalls('Just a plain reply.', {})
    expect(result.anyCalls).toBe(false)
    expect(result.anyFailed).toBe(false)
    expect(result.cleanReply).toBe('Just a plain reply.')
  })

  // T2 case 3: JSON parsing error (tolerant parse)
  it('records bad_arguments on JSON parse error, does not throw', async () => {
    // Must contain closing } to match the regex, but contain invalid syntax inside
    const reply = makeReply('echo', '{"text": "broken" "missing_comma": true}')
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.anyFailed).toBe(true)
    expect(result.calls[0].ok).toBe(false)
    expect(result.calls[0].error).toBe('bad_arguments')
  })

  // T2 case 4: Handler throws
  it('records handler throw as failure, does not rethrow', async () => {
    const reply = makeReply('boom', '{}')
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.anyFailed).toBe(true)
    expect(result.calls[0].ok).toBe(false)
    expect(result.calls[0].error).toContain('handler exploded')
  })

  // T2 case 5: Handler returns null
  it('records null return as failure', async () => {
    const reply = makeReply('nullret', '{}')
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.anyFailed).toBe(true)
    expect(result.calls[0].ok).toBe(false)
  })

  // T2 case 6: Handler returns {error}
  it('records {error} return as failure', async () => {
    const reply = makeReply('errobj', '{}')
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.anyFailed).toBe(true)
    expect(result.calls[0].ok).toBe(false)
    expect(result.calls[0].error).toBe('tool_self_reported_error')
  })

  // T2 case 7: Handler returns requiresConfirmation
  it('surfaces needsConfirm; anyFailed is false for pure confirm', async () => {
    const reply = makeReply('needs_confirm', '{}')
    const result = await executeToolCalls(reply, {})

    expect(result.anyCalls).toBe(true)
    expect(result.anyFailed).toBe(false)
    expect(result.needsConfirm).toBeTruthy()
    expect(result.needsConfirm.tool).toBe('needs_confirm')
    expect(result.needsConfirm.result.message).toBe('Please confirm')
  })

})

describe('toolProtocol — summarizeOutcome', () => {

  it('summarizes empty/no-call runs', () => {
    const run = { anyCalls: false, anyFailed: false, calls: [] }
    expect(summarizeOutcome(run.calls)).toBe('')
  })

  it('summarizes successful runs', () => {
    const run = {
      anyCalls: true,
      anyFailed: false,
      calls: [
        { tool: 'echo', ok: true, result: { ok: true, message: 'hi' } }
      ]
    }
    const summary = summarizeOutcome(run.calls)
    expect(summary).toContain('echo: hi')
    expect(summary).not.toContain('failed')
  })

  it('summarizes failed runs', () => {
    const run = {
      anyCalls: true,
      anyFailed: true,
      calls: [
        { tool: 'echo', ok: true, result: { ok: true, message: 'hi' } },
        { tool: 'boom', ok: false, error: 'exploded' }
      ]
    }
    const summary = summarizeOutcome(run.calls)
    expect(summary).toContain('echo: hi')
    expect(summary).toContain('boom failed: exploded')
  })

})

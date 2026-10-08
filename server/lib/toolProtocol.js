/**
 * server/lib/toolProtocol.js — Engine-agnostic tool execution layer
 * 
 * Used by OpenRouter, Sarvam, and any future text-completion engine.
 * Parses ALL [[TOOL_CALL: name, {...}]] markers, executes each in order,
 * surfaces real errors, handles confirmation prompts.
 */

const { toolRegistry } = require('./irisTools')

const TOOL_RE = /\[\[TOOL_CALL:\s*([a-zA-Z0-9_-]+)\s*,\s*(\{[\s\S]*?\})\]\]/g

/**
 * Execute all tool calls found in a model reply text.
 * @param {string} replyText - raw model output containing [[TOOL_CALL:...]] markers
 * @param {Object} context   - { sessionId, prisma, osState, ... }
 * @returns {Promise<ExecResult>}
 */
async function executeToolCalls(replyText, context) {
  const calls = []
  let primaryAction = null

  // matchAll resets state on each call — no lastIndex issue
  for (const match of replyText.matchAll(TOOL_RE)) {
    const toolName   = match[1].trim()
    const argsString = match[2]

    // 1. Unknown tool
    const handler = toolRegistry[toolName]
    if (!handler) {
      calls.push({ tool: toolName, ok: false, error: 'unknown_tool', args: null })
      continue
    }

    // 2. Tolerant JSON parse
    let args
    try {
      args = JSON.parse(argsString.trim())
    } catch (_) {
      calls.push({ tool: toolName, ok: false, error: 'bad_arguments', args: null })
      continue
    }

    // 3. Execute
    let result
    try {
      result = await handler(args, context)
    } catch (err) {
      calls.push({ tool: toolName, ok: false, error: err.message || String(err), args })
      continue
    }

    // 4. Handler returned an error object
    if (!result || result.error) {
      calls.push({ tool: toolName, ok: false, error: result?.error || 'handler returned falsy', args })
      continue
    }

    // 5. Requires user confirmation (e.g. manage_file delete without confirmed:true)
    if (result.requiresConfirmation) {
      calls.push({ tool: toolName, ok: false, needsConfirm: true, result, args })
      continue
    }

    // 6. Success
    calls.push({ tool: toolName, ok: true, result, args })

    // Capture first frontend action
    if (!primaryAction && result.action) {
      primaryAction = { action: result.action, target: result.target, url: result.url }
    }
  }

  // Strip ALL markers from the reply text
  const cleanReply = replyText.replace(TOOL_RE, '').trim()

  return {
    calls,
    anyCalls:     calls.length > 0,
    anyFailed:    calls.some(c => !c.ok && !c.needsConfirm),
    needsConfirm: calls.find(c => c.needsConfirm) || null,
    primaryAction,
    cleanReply
  }
}

/**
 * Build a short, honest status string from tool results.
 * Used as fallback when the LLM summary is empty.
 */
function summarizeOutcome(calls) {
  if (!calls.length) return ''

  const parts = calls.map(c => {
    if (c.needsConfirm) return `${c.tool}: needs confirmation — ${c.result?.message || 'please confirm'}`
    if (!c.ok)          return `${c.tool} failed: ${c.error}`

    // Build a short success label from the result
    const r = c.result
    const hint =
      r.created   ? `created ${r.created}` :
      r.saved     ? `saved ${r.saved}` :
      r.written   ? `wrote ${r.written}` :
      r.deleted   ? `deleted` :
      r.moved     ? `moved to ${r.to}` :
      r.message   ? r.message :
      'done'
    return `${c.tool}: ${hint}`
  })

  return parts.join('; ') + '.'
}

module.exports = { executeToolCalls, summarizeOutcome, TOOL_RE }

/**
 * server/lib/memory.js — Mem0 Long-Term Memory Service
 *
 * Provides semantic long-term memory for IRIS via the Mem0 cloud API,
 * with a local JSON fallback so SpiritOS works fully offline.
 *
 * Backend used is logged on each call ("mem0" | "local-fallback").
 * Callers are never crashed — every exported function catches internally.
 *
 * Exports:
 *   addMemory(userId, text, metadata?)    → stores a memory
 *   searchMemories(userId, query, limit)  → returns relevant memories
 *   getAllMemories(userId)               → lists all memories for a user
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const MEM0_TIMEOUT_MS = 3000
const LOCAL_DIR       = path.join(__dirname, '..', 'data', 'memories')

// ── Lazy-init Mem0 client ─────────────────────────────────────────────────────

let _mem0Client = null
let _mem0Tried  = false

function getMem0Client() {
  if (_mem0Tried) return _mem0Client
  _mem0Tried = true
  const apiKey = process.env.MEM0_API_KEY
  if (!apiKey) {
    console.log('[Memory] MEM0_API_KEY not set — using local fallback only')
    return null
  }
  try {
    // mem0ai exports a class-based client
    const { MemoryClient } = require('mem0ai')
    _mem0Client = new MemoryClient({ apiKey })
    console.log('[Memory] Mem0 client initialised')
  } catch (err) {
    console.warn('[Memory] Failed to load mem0ai SDK:', err.message, '— using local fallback')
    _mem0Client = null
  }
  return _mem0Client
}

// ── Local JSON fallback helpers ───────────────────────────────────────────────

function localPath(userId) {
  const safe = String(userId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(LOCAL_DIR, `${safe}.json`)
}

function localRead(userId) {
  try {
    fs.mkdirSync(LOCAL_DIR, { recursive: true })
    const p = localPath(userId)
    if (!fs.existsSync(p)) return []
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch (_) {
    return []
  }
}

function localWrite(userId, entries) {
  try {
    fs.mkdirSync(LOCAL_DIR, { recursive: true })
    fs.writeFileSync(localPath(userId), JSON.stringify(entries, null, 2))
  } catch (err) {
    console.warn('[Memory/local] Write failed:', err.message)
  }
}

function localAdd(userId, text, metadata) {
  const entries = localRead(userId)
  entries.push({
    id:        Date.now().toString(),
    memory:    text,
    metadata:  metadata || {},
    createdAt: new Date().toISOString()
  })
  // Cap to 200 memories per user to keep the file manageable
  if (entries.length > 200) entries.splice(0, entries.length - 200)
  localWrite(userId, entries)
}

function localSearch(userId, query, limit = 5) {
  const entries = localRead(userId)
  if (!entries.length) return []
  // Simple keyword matching — tokenise both sides and score overlap
  const qWords = String(query).toLowerCase().split(/\W+/).filter(w => w.length > 2)
  if (!qWords.length) return entries.slice(-limit)

  const scored = entries.map(e => {
    const text   = (e.memory || '').toLowerCase()
    const hits   = qWords.filter(w => text.includes(w)).length
    return { ...e, _score: hits }
  })

  return scored
    .filter(e => e._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score: _s, ...rest }) => rest)   // strip internal _score field
}

// ── Promise with timeout helper ───────────────────────────────────────────────

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`mem0 timeout after ${ms}ms`)), ms)
    )
  ])
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Add a memory for a user.
 * @param {string}  userId
 * @param {string}  text      – the memory text (a fact, preference, etc.)
 * @param {Object}  [metadata] – optional key/value metadata
 */
async function addMemory(userId, text, metadata = {}) {
  if (!text || !userId) return
  const client = getMem0Client()

  if (client) {
    try {
      await withTimeout(
        client.add([{ role: 'user', content: text }], {
          user_id:  userId,
          metadata: { ...metadata, source: 'spiritos' }
        }),
        MEM0_TIMEOUT_MS
      )
      console.log(`[Memory] mem0 ← added memory for ${userId}`)
      return
    } catch (err) {
      console.warn(`[Memory] mem0 add failed, falling back to local: ${err.message}`)
    }
  }

  // Local fallback
  localAdd(userId, text, metadata)
  console.log(`[Memory] local-fallback ← added memory for ${userId}`)
}

/**
 * Search memories relevant to a query.
 * @param {string}  userId
 * @param {string}  query
 * @param {number}  [limit=5]
 * @returns {Promise<Array<{memory:string, ...}>>}
 */
async function searchMemories(userId, query, limit = 5) {
  if (!userId || !query) return []
  const client = getMem0Client()

  if (client) {
    try {
      const resp = await withTimeout(
        client.search(query, { filters: { user_id: userId }, limit }),
        MEM0_TIMEOUT_MS
      )
      const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.results) ? resp.results : [])
      console.log(`[Memory] mem0 ← searched memories for ${userId} (${list.length} results)`)
      return list.slice(0, limit)
    } catch (err) {
      console.warn(`[Memory] mem0 search failed, falling back to local: ${err.message}`)
    }
  }

  // Local fallback
  const results = localSearch(userId, query, limit)
  console.log(`[Memory] local-fallback ← searched memories for ${userId} (${results.length} results)`)
  return results
}

/**
 * Get ALL memories for a user (for the "what do you know about me" tool).
 * @param {string} userId
 * @returns {Promise<Array<{memory:string, ...}>>}
 */
async function getAllMemories(userId) {
  if (!userId) return []
  const client = getMem0Client()

  if (client) {
    try {
      const resp = await withTimeout(
        client.getAll({ filters: { user_id: userId } }),
        MEM0_TIMEOUT_MS
      )
      const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.results) ? resp.results : [])
      console.log(`[Memory] mem0 ← getAllMemories for ${userId} (${list.length} results)`)
      return list
    } catch (err) {
      console.warn(`[Memory] mem0 getAll failed, falling back to local: ${err.message}`)
    }
  }

  const entries = localRead(userId)
  console.log(`[Memory] local-fallback ← getAllMemories for ${userId}`)
  return entries
}

module.exports = { addMemory, searchMemories, getAllMemories }

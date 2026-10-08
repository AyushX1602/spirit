/**
 * server/lib/openAIClient.js — OpenAI LLM Fallback
 *
 * Uses the OpenAI API (gpt-4o-mini first, gpt-3.5-turbo as backup)
 * as a paid fallback tier when Gemini rate-limits.
 * Wire-up in irisEngine.js via OPENAI_API_KEY env var.
 */

const _process = require('process')

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 25000

const OPENAI_MODELS = [
  'gpt-4o-mini',      // Best cost/quality ratio — ~$0.15/1M input tokens
  'gpt-3.5-turbo',    // Cheapest backup
]

const rateLimited = new Map()
const RATE_LIMIT_COOLDOWN = 60000

function isRateLimited(model) {
  const ts = rateLimited.get(model)
  if (!ts) return false
  if (Date.now() - ts > RATE_LIMIT_COOLDOWN) { rateLimited.delete(model); return false }
  return true
}

function isOpenAIAvailable() {
  return !!_process.env.OPENAI_API_KEY
}

async function chatWithOpenAI(userMessage, systemPrompt, opts = {}) {
  const apiKey = _process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const messages = [
    { role: 'system', content: systemPrompt || 'You are IRIS, a helpful AI assistant for SpiritOS.' },
    { role: 'user',   content: userMessage }
  ]

  for (const model of OPENAI_MODELS) {
    if (isRateLimited(model)) continue

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens:  opts.maxTokens || 1024,
          temperature: opts.temperature || 0.7
        }),
        signal: controller.signal
      })

      if (res.status === 429) {
        rateLimited.set(model, Date.now())
        console.warn(`[OpenAI] Rate limited: ${model}`)
        continue
      }

      if (res.status === 401) {
        console.error('[OpenAI] Invalid API key — check OPENAI_API_KEY in .env')
        return null
      }

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content?.trim()) {
          console.log(`[OpenAI] ✓ ${model} raw reply:`, content.slice(0, 300))
          return content.trim()
        }
      } else {
        const body = await res.text().catch(() => '')
        console.warn(`[OpenAI] ${model} → HTTP ${res.status}: ${body.slice(0, 100)}`)
      }
    } catch (err) {
      if (err.name === 'AbortError') console.warn(`[OpenAI] ${model} → Timeout`)
      else console.warn(`[OpenAI] ${model} → Error: ${err.message}`)
    } finally {
      clearTimeout(timeout)
    }
  }

  console.warn('[OpenAI] All models exhausted')
  return null
}

module.exports = { chatWithOpenAI, isOpenAIAvailable }

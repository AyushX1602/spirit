/**
 * server/lib/groqClient.js — Groq LLM Fallback
 *
 * Uses the Groq API (groq-sdk or direct fetch) as a fast fallback tier
 * between Gemini and OpenRouter/Spirit. Groq free-tier is extremely generous
 * (14,400 req/day for llama-3.3-70b) so it rarely rate-limits in practice.
 */

const _process = require('process')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 20000

// Per-model 429 cooldown (60s)
const rateLimited = new Map()
const RATE_LIMIT_COOLDOWN = 60000

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',   // Best for tool-calling tasks
  'llama3-8b-8192',            // Ultra-fast fallback
]

function isRateLimited(model) {
  const ts = rateLimited.get(model)
  if (!ts) return false
  if (Date.now() - ts > RATE_LIMIT_COOLDOWN) { rateLimited.delete(model); return false }
  return true
}

function isGroqAvailable() {
  return !!_process.env.GROQ_API_KEY
}

async function chatWithGroq(userMessage, systemPrompt, opts = {}) {
  const apiKey = _process.env.GROQ_API_KEY
  if (!apiKey) return null

  const messages = [
    { role: 'system', content: systemPrompt || 'You are IRIS, a helpful AI assistant for SpiritOS.' },
    { role: 'user',   content: userMessage }
  ]

  for (const model of GROQ_MODELS) {
    if (isRateLimited(model)) continue

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(GROQ_API_URL, {
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
        console.warn(`[Groq] Rate limited: ${model}`)
        continue
      }

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content?.trim()) {
          console.log(`[Groq] ✓ ${model}`)
          return content.trim()
        }
      } else {
        console.warn(`[Groq] ${model} → HTTP ${res.status}`)
      }
    } catch (err) {
      if (err.name === 'AbortError') console.warn(`[Groq] ${model} → Timeout`)
      else console.warn(`[Groq] ${model} → Error: ${err.message}`)
    } finally {
      clearTimeout(timeout)
    }
  }

  console.warn('[Groq] All models exhausted')
  return null
}

module.exports = { chatWithGroq, isGroqAvailable }

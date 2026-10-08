/**
 * server/lib/sarvam.js — Sarvam AI client wrapper
 *
 * Thin wrapper around the Sarvam API (https://api.sarvam.ai).
 * Endpoints verified against Sarvam docs (June 2025):
 *   STT:       POST /speech-to-text       (model saarika:v2)
 *   TTS:       POST /text-to-speech       (model bulbul:v2)
 *   Translate: POST /translate            (model mayura:v1)
 *   Chat:      POST /v1/chat/completions  (sarvam-m model, OpenAI-compatible)
 *
 * SECURITY: SARVAM_API_KEY is read from process.env server-side only.
 * This file must never be imported by any client/ code.
 *
 * All functions throw SarvamDisabledError when Sarvam is off, or
 * SarvamError (with .status) on HTTP failures.
 */

const _process = require('process')

// ── Error types ──────────────────────────────────────────────────────────────

class SarvamDisabledError extends Error {
  constructor() {
    super('Sarvam is disabled (SARVAM_ENABLED != true or SARVAM_API_KEY not set)')
    this.name = 'SarvamDisabledError'
  }
}

class SarvamError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'SarvamError'
    this.status = status
  }
}

// ── Config helpers ───────────────────────────────────────────────────────────

function isSarvamEnabled() {
  return _process.env.SARVAM_ENABLED === 'true' && !!_process.env.SARVAM_API_KEY
}

function baseUrl() {
  return (_process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai').replace(/\/$/, '')
}

function headers(extra = {}) {
  return {
    'api-subscription-key': _process.env.SARVAM_API_KEY,
    ...extra
  }
}

// ── HTTP helper ──────────────────────────────────────────────────────────────

async function sarvamFetch(path, { method = 'POST', body, contentType = 'application/json' } = {}) {
  const url = `${baseUrl()}${path}`
  const hdrs = headers(contentType ? { 'Content-Type': contentType } : {})

  const res = await fetch(url, {
    method,
    headers: hdrs,
    body: contentType === 'application/json' ? JSON.stringify(body) : body
  })

  if (!res.ok) {
    // Never include response body that might echo the key back
    throw new SarvamError(`Sarvam API ${path} failed: HTTP ${res.status}`, res.status)
  }

  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.arrayBuffer()
}

// ── STT — speech → text ──────────────────────────────────────────────────────

/**
 * Transcribe audio with Sarvam Saarika v2.
 * @param {Buffer} audioBuffer  - Raw audio bytes (wav / webm / ogg)
 * @param {Object} opts
 * @param {string} [opts.languageCode='hi-IN']  - BCP-47 locale
 * @param {string} [opts.model='saarika:v2']
 * @returns {Promise<{transcript: string, languageCode: string}>}
 */
async function sarvamSTT(audioBuffer, { languageCode = 'hi-IN', model = 'saarika:v2' } = {}) {
  if (!isSarvamEnabled()) throw new SarvamDisabledError()

  // Sarvam STT expects multipart/form-data
  const { FormData, Blob } = globalThis

  let formData
  if (typeof FormData !== 'undefined') {
    formData = new FormData()
    formData.append('model', model)
    formData.append('language_code', languageCode)
    formData.append('file', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav')
  } else {
    // Node 18 doesn't have global FormData — fall back to manual multipart
    const boundary = `----SarvamBoundary${Date.now()}`
    const CRLF = '\r\n'
    const parts = [
      `--${boundary}${CRLF}Content-Disposition: form-data; name="model"${CRLF}${CRLF}${model}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="language_code"${CRLF}${CRLF}${languageCode}`,
      `--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="audio.wav"${CRLF}Content-Type: audio/wav${CRLF}${CRLF}`
    ]
    const prefix = Buffer.from(parts.join(CRLF) + CRLF)
    const suffix = Buffer.from(`${CRLF}--${boundary}--${CRLF}`)
    const body   = Buffer.concat([prefix, audioBuffer, suffix])

    const url = `${baseUrl()}/speech-to-text`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-subscription-key': _process.env.SARVAM_API_KEY,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body
    })
    if (!res.ok) throw new SarvamError(`Sarvam STT failed: HTTP ${res.status}`, res.status)
    const data = await res.json()
    return { transcript: data.transcript || '', languageCode: data.language_code || languageCode }
  }

  const data = await sarvamFetch('/speech-to-text', { body: formData, contentType: null })
  return { transcript: data.transcript || '', languageCode: data.language_code || languageCode }
}

// ── TTS — text → speech ──────────────────────────────────────────────────────

// bulbul:v3 supports up to 2500 chars per request
const TTS_CHUNK_LIMIT = 2500

/**
 * Synthesise speech with Sarvam Bulbul v3.
 * Correct body format per official docs (June 2025):
 *   { text, target_language_code, speaker, model, pace }
 * Note: "inputs" array is NOT the correct field — it must be "text" (string).
 * Note: bulbul:v3 does NOT support enable_preprocessing, pitch, or loudness.
 * @param {string} text
 * @param {Object} opts
 * @param {string} [opts.languageCode='hi-IN']
 * @param {string} [opts.speaker]  - Valid bulbul:v3 speaker id (e.g. priya, ritu, neha)
 * @returns {Promise<{audioBase64: string, mimeType: string}>}
 */
async function sarvamTTS(text, {
  languageCode = 'hi-IN',
  speaker
} = {}) {
  if (!isSarvamEnabled()) throw new SarvamDisabledError()

  // Default to anushka (bulbul:v2 female — natural Indian female voice)
  const spkr = (speaker || _process.env.SARVAM_TTS_SPEAKER || 'anushka').toLowerCase()

  // Determine model based on speaker: v2 speakers use bulbul:v2, v3 speakers use bulbul:v3
  const V2_SPEAKERS = new Set(['anushka','manisha','vidya','arya','abhilash','karun','hitesh'])
  const model = V2_SPEAKERS.has(spkr) ? 'bulbul:v2' : 'bulbul:v3'
  // v2 max 1500 chars, v3 max 2500 chars
  const CHUNK = model === 'bulbul:v2' ? 1500 : 2500

  // Split into chunks at sentence boundaries
  const chunks = []
  let remaining = text.trim()
  while (remaining.length > CHUNK) {
    const sub = remaining.slice(0, CHUNK)
    const lastPeriod = Math.max(
      sub.lastIndexOf('।'), sub.lastIndexOf('.'),
      sub.lastIndexOf('?'), sub.lastIndexOf('!')
    )
    const splitAt = lastPeriod > CHUNK / 2 ? lastPeriod + 1 : CHUNK
    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }
  if (remaining) chunks.push(remaining)

  const audioBuffers = []
  for (const chunk of chunks) {
    // Correct request body per Sarvam docs — "text" string, not "inputs" array
    const body = {
      text: chunk,
      target_language_code: languageCode,
      speaker: spkr,
      model,
      pace: 1.0
    }
    // v2 supports enable_preprocessing, v3 does not
    if (model === 'bulbul:v2') body.enable_preprocessing = true
    const data = await sarvamFetch('/text-to-speech', { body })
    // Response: { audios: ["<base64 wav>"] }
    if (data.audios?.[0]) {
      audioBuffers.push(Buffer.from(data.audios[0], 'base64'))
    }
  }

  if (!audioBuffers.length) throw new SarvamError('TTS returned no audio', 500)

  // Concatenate into ONE valid WAV. Each chunk is a full WAV file with its own
  // 44-byte RIFF header; naive Buffer.concat would leave multiple headers, so the
  // browser would only play the first chunk (its header's data size covers chunk 1
  // only). We keep the first header, strip the rest, append all PCM data, then
  // rewrite the RIFF + data chunk sizes so the whole reply plays.
  const combined = concatWavBuffers(audioBuffers)
  return {
    audioBase64: combined.toString('base64'),
    mimeType: 'audio/wav'
  }
}

/**
 * Join multiple PCM WAV buffers into a single valid WAV.
 * Locates the 'data' chunk in each buffer (handles non-standard header lengths),
 * keeps the first file's header, concatenates every chunk's PCM payload, then
 * patches the RIFF size (offset 4) and data size (just before the payload).
 */
function concatWavBuffers(buffers) {
  if (buffers.length === 1) return buffers[0]

  const first = buffers[0]
  const firstDataIdx = first.indexOf('data')
  // If we can't locate a data chunk, fall back to first chunk only (still valid).
  if (firstDataIdx < 0) return first
  const headerLen = firstDataIdx + 8 // 'data' (4 bytes) + size field (4 bytes)

  const header = Buffer.from(first.subarray(0, headerLen))
  const pcmParts = [first.subarray(headerLen)]
  for (let i = 1; i < buffers.length; i++) {
    const b = buffers[i]
    const di = b.indexOf('data')
    pcmParts.push(di < 0 ? b : b.subarray(di + 8))
  }

  const pcm = Buffer.concat(pcmParts)
  const combined = Buffer.concat([header, pcm])
  // RIFF chunk size = total file size - 8 (offset 4, little-endian)
  combined.writeUInt32LE(headerLen + pcm.length - 8, 4)
  // data chunk size = PCM payload length (the 4 bytes right before the payload)
  combined.writeUInt32LE(pcm.length, headerLen - 4)
  return combined
}

// ── Translate ─────────────────────────────────────────────────────────────────

/**
 * Translate text with Sarvam Mayura v1.
 * @param {string} text
 * @param {Object} opts
 * @param {string} opts.source  - source language code (e.g. 'en-IN')
 * @param {string} opts.target  - target language code (e.g. 'hi-IN')
 * @returns {Promise<{text: string}>}
 */
async function sarvamTranslate(text, { source = 'en-IN', target = 'hi-IN' } = {}) {
  if (!isSarvamEnabled()) throw new SarvamDisabledError()

  const body = {
    input: text,
    source_language_code: source,
    target_language_code: target,
    model: 'mayura:v1',
    enable_preprocessing: true
  }
  const data = await sarvamFetch('/translate', { body })
  return { text: data.translated_text || text }
}

// ── Chat (Sarvam-M) ───────────────────────────────────────────────────────────

/**
 * Chat completion with Sarvam-M (OpenAI-compatible).
 * @param {Array<{role:string, content:string}>} messages
 * @param {Object} opts
 * @param {string} [opts.systemPrompt]
 * @returns {Promise<{message: string}>}
 */
async function sarvamChat(messages, { systemPrompt } = {}) {
  if (!isSarvamEnabled()) throw new SarvamDisabledError()

  const allMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  const body = {
    model: 'sarvam-m',
    messages: allMessages,
    max_tokens: 1024,
    temperature: 0.7
  }

  const data = await sarvamFetch('/v1/chat/completions', { body })
  const text = data.choices?.[0]?.message?.content || ''
  return { message: text }
}

module.exports = {
  isSarvamEnabled,
  sarvamSTT,
  sarvamTTS,
  sarvamTranslate,
  sarvamChat,
  SarvamDisabledError,
  SarvamError
}

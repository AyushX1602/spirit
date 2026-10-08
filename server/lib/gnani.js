/**
 * server/lib/gnani.js — Gnani AI (Vachana) voice adapter  [HACKATHON PARTNER]
 *
 * STT: POST https://api.vachana.ai/stt/v3           (multipart/form-data)
 * TTS: POST https://api.vachana.ai/api/v1/tts/inference (JSON → binary audio)
 * Auth: X-API-Key-ID header (GNANI_API_KEY from env, server-side only)
 *
 * Return shapes intentionally mirror lib/sarvam.js so routes/voice.js can use
 * Gnani as a drop-in fallback tier without any client changes:
 *   gnaniSTT -> { transcript, languageCode, engine: 'gnani' }
 *   gnaniTTS -> { audioBase64, mimeType, engine: 'gnani' }
 *
 * SECURITY: never expose GNANI_API_KEY to the client.
 */

'use strict'

class GnaniDisabledError extends Error {
  constructor() {
    super('Gnani is not enabled (set GNANI_API_KEY in .env)')
    this.name = 'GnaniDisabledError'
  }
}

class GnaniError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'GnaniError'
    this.status = status
  }
}

const STT_LANGUAGES = new Set([
  'bn-IN', 'en-IN', 'gu-IN', 'hi-IN', 'kn-IN',
  'ml-IN', 'mr-IN', 'pa-IN', 'ta-IN', 'te-IN'
])

// Valid pre-defined Gnani TTS voices (vachana-voice-v3)
const TTS_VOICES = new Set(['Karan', 'Simran', 'Nara', 'Riya', 'Viraj', 'Raju', 'Pranav'])

function baseUrl() {
  return process.env.GNANI_BASE_URL || 'https://api.vachana.ai'
}

function isGnaniEnabled() {
  return Boolean(process.env.GNANI_API_KEY)
}

function timeoutSignal(ms) {
  // AbortSignal.timeout exists on Node 17.3+; fall back gracefully otherwise
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    return AbortSignal.timeout(ms)
  }
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms).unref?.()
  return controller.signal
}

/**
 * Speech-to-text via Gnani Prisma v2.5 (REST, clips <= 60s).
 * @param {Buffer} audioBuffer - audio bytes (WAV/MP3/OGG/FLAC/AAC/M4A)
 * @param {Object} opts
 * @param {string} [opts.languageCode='hi-IN'] - BCP-47 code (see STT_LANGUAGES)
 * @param {string} [opts.mimeType='audio/wav']
 */
async function gnaniSTT(audioBuffer, { languageCode = 'hi-IN', mimeType = 'audio/wav' } = {}) {
  if (!isGnaniEnabled()) throw new GnaniDisabledError()

  const lang = STT_LANGUAGES.has(languageCode) ? languageCode : 'hi-IN'

  const form = new FormData()
  form.append('audio_file', new Blob([audioBuffer], { type: mimeType }), 'audio.wav')
  form.append('language_code', lang)
  // ITN (numbers/currency/dates written properly) is only supported for hi-IN & en-IN
  form.append('format', (lang === 'hi-IN' || lang === 'en-IN') ? 'transcribe' : 'verbatim')

  const res = await fetch(`${baseUrl()}/stt/v3`, {
    method: 'POST',
    headers: { 'X-API-Key-ID': process.env.GNANI_API_KEY },
    body: form,
    signal: timeoutSignal(Number(process.env.GNANI_TIMEOUT_MS || 15000))
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new GnaniError(`Gnani STT failed: HTTP ${res.status} ${body.slice(0, 200)}`, res.status)
  }

  const data = await res.json()
  if (data.success === false) {
    throw new GnaniError(`Gnani STT error: ${data.error?.message || 'unknown'}`, 500)
  }

  return {
    transcript: data.transcript || '',
    languageCode: lang,
    engine: 'gnani',
    requestId: data.request_id
  }
}

/**
 * Text-to-speech via Gnani (vachana-voice-v3, REST).
 * Returns base64 WAV audio, same shape as sarvamTTS.
 * @param {string} text
 * @param {Object} opts
 * @param {string} [opts.voice] - Karan | Simran | Nara | Riya | Viraj | Raju | Pranav
 */
async function gnaniTTS(text, { voice } = {}) {
  if (!isGnaniEnabled()) throw new GnaniDisabledError()
  if (!text || !text.trim()) throw new GnaniError('TTS text is empty', 400)

  const envVoice = process.env.GNANI_TTS_VOICE
  const requested = (voice && voice.trim()) ? voice.trim()
    : (envVoice && envVoice.trim()) ? envVoice.trim()
    : 'Pranav'
  const chosenVoice = Array.from(TTS_VOICES).find(v => v.toLowerCase() === requested.toLowerCase()) || requested

  const res = await fetch(`${baseUrl()}/api/v1/tts/inference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key-ID': process.env.GNANI_API_KEY
    },
    body: JSON.stringify({
      text: text.slice(0, 4000),
      voice: chosenVoice,
      model: 'vachana-voice-v3',
      audio_config: {
        sample_rate: 22050,
        num_channels: 1,
        sample_width: 2,
        encoding: 'linear_pcm',
        container: 'wav'
      }
    }),
    signal: timeoutSignal(Number(process.env.GNANI_TIMEOUT_MS || 20000))
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new GnaniError(`Gnani TTS failed: HTTP ${res.status} ${body.slice(0, 200)}`, res.status)
  }

  const audio = Buffer.from(await res.arrayBuffer())
  if (!audio.length) throw new GnaniError('Gnani TTS returned no audio', 500)

  return {
    audioBase64: audio.toString('base64'),
    mimeType: 'audio/wav',
    engine: 'gnani'
  }
}

module.exports = {
  isGnaniEnabled,
  gnaniSTT,
  gnaniTTS,
  GnaniDisabledError,
  GnaniError
}

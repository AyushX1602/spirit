/**
 * server/routes/voice.js — Sarvam Voice API routes
 *
 * POST /api/voice/tts  — text-to-speech (Sarvam when enabled, fallback signal otherwise)
 * POST /api/voice/stt  — speech-to-text (Sarvam when enabled, fallback signal otherwise)
 * POST /api/voice/translate — translate text via Sarvam Mayura
 *
 * When Sarvam is disabled or unavailable, every route returns HTTP 200
 * with { fallback: 'webspeech' } so the client can transparently fall back
 * to the Web Speech API without treating it as an error.
 *
 * SECURITY: This file never sends SARVAM_API_KEY to the client.
 * All keys are read from process.env server-side only.
 */

const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const { isSarvamEnabled, sarvamTTS, sarvamSTT, sarvamTranslate, SarvamDisabledError } = require('../lib/sarvam')
const { isGnaniEnabled, gnaniTTS, gnaniSTT } = require('../lib/gnani')

// ── Multipart upload for STT audio (in-memory, max 10 MB) ───────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

// ── Shared error handler ─────────────────────────────────────────────────────
function handleSarvamError(err, res) {
  if (err instanceof SarvamDisabledError) {
    return res.json({ fallback: 'webspeech' })
  }
  // Network / API errors — return fallback so the client degrades gracefully
  console.warn('[Voice] Sarvam error (non-fatal, falling back):', err.message)
  return res.json({ fallback: 'webspeech', reason: err.message })
}

// ── POST /api/voice/tts ──────────────────────────────────────────────────────
router.post('/tts', async (req, res) => {
  try {
    const { text, languageCode, speaker } = req.body || {}

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' })
    }
    if (text.length > 4000) {
      return res.status(400).json({ error: 'text too long (max 4000 chars)' })
    }

    // Tier 1: Gnani AI (hackathon partner — primary Indian voice engine)
    if (isGnaniEnabled()) {
      try {
        const result = await gnaniTTS(text, { voice: req.body?.gnaniVoice || speaker, languageCode })
        return res.json(result)
      } catch (err) {
        console.warn('[Voice] Gnani TTS failed, trying Sarvam:', err.message)
      }
    }

    // Tier 2: Sarvam (fallback)
    if (isSarvamEnabled()) {
      try {
        const result = await sarvamTTS(text, {
          languageCode: languageCode || 'hi-IN',
          speaker: speaker || undefined
        })
        return res.json(result)
      } catch (err) {
        console.warn('[Voice] Sarvam TTS failed, falling back to webspeech:', err.message)
      }
    }

    return res.json({ fallback: 'webspeech' })
  } catch (err) {
    return handleSarvamError(err, res)
  }
})

// ── POST /api/voice/stt ──────────────────────────────────────────────────────
router.post('/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'audio file is required' })
    }

    const languageCode = req.body?.languageCode || 'hi-IN'

    // Tier 1: Gnani AI (hackathon partner — primary Indian voice engine)
    if (isGnaniEnabled()) {
      try {
        const result = await gnaniSTT(req.file.buffer, { languageCode, mimeType: req.file.mimetype })
        return res.json(result)
      } catch (err) {
        console.warn('[Voice] Gnani STT failed, trying Sarvam:', err.message)
      }
    }

    // Tier 2: Sarvam (fallback)
    if (isSarvamEnabled()) {
      try {
        const result = await sarvamSTT(req.file.buffer, { languageCode })
        return res.json(result)
      } catch (err) {
        console.warn('[Voice] Sarvam STT failed, falling back to webspeech:', err.message)
      }
    }

    return res.json({ fallback: 'webspeech' })
  } catch (err) {
    return handleSarvamError(err, res)
  }
})

// ── POST /api/voice/translate ────────────────────────────────────────────────
router.post('/translate', async (req, res) => {
  try {
    const { text, source, target } = req.body || {}

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' })
    }
    if (text.length > 4000) {
      return res.status(400).json({ error: 'text too long (max 4000 chars)' })
    }

    if (!isSarvamEnabled()) {
      return res.json({ fallback: 'webspeech' })
    }

    const result = await sarvamTranslate(text, {
      source: source || 'en-IN',
      target: target || 'hi-IN'
    })
    return res.json(result)
  } catch (err) {
    return handleSarvamError(err, res)
  }
})

// ── GET /api/voice/status ────────────────────────────────────────────────────
router.get('/status', (req, res) => {
  // Expose the speaker the server will actually use (client speaker > env > anushka/Riya)
  // so the client can send a concrete speaker and match the Web Speech fallback gender.
  const defaultSpeaker = isGnaniEnabled()
    ? (process.env.GNANI_TTS_VOICE || 'Riya')
    : (process.env.SARVAM_TTS_SPEAKER || 'anushka').toLowerCase()
  res.json({
    sarvamEnabled: isSarvamEnabled(),
    gnaniEnabled: isGnaniEnabled(),
    gnaniVoice: process.env.GNANI_TTS_VOICE || 'Riya',
    defaultSpeaker
  })
})

module.exports = router

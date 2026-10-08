/**
 * speechBus — single coordinator for ALL spoken output in SpiritOS.
 *
 * Fixes two real bugs:
 *  1. "Two voices speak one after another" — the IRIS Live path speaks via Sarvam
 *     (server speaker, e.g. SARVAM_TTS_SPEAKER=shubh, male) while the command
 *     path + notifications speak via the Web Speech API (browser default voice,
 *     often a different gender). When both fire for the same reply you hear it
 *     twice in two voices. speechBus de-dupes identical text within a short
 *     window and force-stops any in-flight speech/audio so only ONE voice plays.
 *  2. Gender flip — the Web Speech *fallback* now matches the gender of the
 *     active Sarvam speaker, so falling back from Sarvam to Web Speech never
 *     switches between a male and female voice.
 */

import useOsStore from '../store/osStore'

// ── De-dupe + single-utterance lock ──────────────────────────────────────

let _lastText = ''
let _lastAt = 0
let _currentAudio = null
const DEDUPE_MS = 2500

/**
 * Returns true if this text should be spoken now. Identical text within
 * DEDUPE_MS is suppressed — this is what stops the same assistant reply from
 * being spoken by two different engines back-to-back.
 */
export function claimSpeech(text) {
  const norm = (text || '').trim()
  if (!norm) return false
  const now = Date.now()
  if (norm === _lastText && now - _lastAt < DEDUPE_MS) return false
  _lastText = norm
  _lastAt = now
  return true
}

/** Force-stop any current Web Speech utterance AND any Sarvam <audio> playback. */
export function stopAll() {
  try { window.speechSynthesis?.cancel() } catch (_) {}
  if (_currentAudio) {
    try { _currentAudio.pause(); _currentAudio.src = '' } catch (_) {}
    _currentAudio = null
  }
}

/** Register the Sarvam <audio> element so stopAll() can interrupt it. */
export function setCurrentAudio(audio) {
  _currentAudio = audio
}

// ── Server default speaker (so client + server agree) ────────────────────────

// The server resolves the speaker as: client speaker || SARVAM_TTS_SPEAKER || 'anushka'.
// We fetch the effective default once so the Web Speech fallback can match its
// gender, and so we can send a concrete speaker on every request.
let _serverDefaultSpeaker = null
let _statusFetched = false

export async function getServerDefaultSpeaker() {
  if (_statusFetched) return _serverDefaultSpeaker
  _statusFetched = true
  try {
    const res = await fetch('/api/voice/status')
    if (res.ok) {
      const data = await res.json()
      _serverDefaultSpeaker = (data.defaultSpeaker || '').toLowerCase() || null
    }
  } catch (_) { /* offline — leave null */ }
  return _serverDefaultSpeaker
}

/** The speaker that will actually play: user choice → server default → anushka. */
export function effectiveSpeaker() {
  let chosen = ''
  try { chosen = (useOsStore.getState().sarvamSpeaker || '').toLowerCase() } catch (_) {}
  return chosen || _serverDefaultSpeaker || 'anushka'
}

// ── Gender mapping ────────────────────────────────────────────────────────

const FEMALE_SPEAKERS = new Set([
  'priya', 'ritu', 'neha', 'pooja', 'simran', 'kavya', 'ishita', 'shreya',
  'tanya', 'shruti', 'suhani', 'anushka', 'manisha', 'vidya', 'arya',
  'riya', 'nara'
])
const MALE_SPEAKERS = new Set([
  'shubh', 'aditya', 'rahul', 'rohan', 'amit', 'dev', 'kabir', 'mani', 'mohit',
  'abhilash', 'karun', 'hitesh',
  'pranav', 'karan', 'viraj', 'raju'
])

/** Gender of the voice that will actually play (used for the fallback). */
export function desiredGender() {
  const spk = effectiveSpeaker()
  if (MALE_SPEAKERS.has(spk)) return 'male'
  if (FEMALE_SPEAKERS.has(spk)) return 'female'
  return 'female' // anushka (code default) is female
}

// ── Cached, gender-aware Web Speech voice picker ─────────────────────────────

let _voices = []
function refreshVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  if (typeof window.speechSynthesis.getVoices !== 'function') return
  const v = window.speechSynthesis.getVoices()
  if (v && v.length) _voices = v
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
  setTimeout(refreshVoices, 250)
}

const FEMALE_HINTS = ['female', 'woman', 'zira', 'susan', 'samantha', 'victoria',
  'karen', 'tessa', 'fiona', 'moira', 'veena', 'aria', 'jenny', 'neerja', 'heera',
  'kalpana', 'swara', 'salli', 'joanna', 'google हिन्दी', 'google us english']
const MALE_HINTS = ['male', 'man', 'david', 'mark', 'ravi', 'hemant', 'madhur',
  'prabhat', 'guy', 'george', 'james', 'matthew', 'daniel', 'rishi']

function classify(voice) {
  const n = (voice?.name || '').toLowerCase()
  if (FEMALE_HINTS.some(h => n.includes(h))) return 'female'
  if (MALE_HINTS.some(h => n.includes(h))) return 'male'
  return 'unknown'
}

const _pinned = new Map()
function pickVoice(locale, gender) {
  if (!_voices.length) refreshVoices()
  if (!_voices.length) return null
  const key = `${locale}|${gender}`
  const cached = _pinned.get(key)
  if (cached && _voices.includes(cached)) return cached
  const base = locale.split('-')[0]
  const sameLocale = _voices.filter(v => v.lang === locale)
  const sameBase = _voices.filter(v => v.lang && v.lang.startsWith(base))
  const byGender = (list) => list.find(v => classify(v) === gender)
  const chosen =
    byGender(sameLocale) || byGender(sameBase) ||
    sameLocale[0] || sameBase[0] ||
    byGender(_voices) ||
    _voices.find(v => v.lang && v.lang.startsWith('en')) || _voices[0] || null
  if (chosen) _pinned.set(key, chosen)
  return chosen
}

// ── The single Web Speech speak function ──────────────────────────────────

/**
 * Speak via Web Speech with a stable, gender-correct voice.
 * Honors the de-dupe lock unless { force:true } is passed.
 */
export function synthSpeak(text, opts = {}) {
  return new Promise((resolve) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return }
    if (!opts.force && !claimSpeech(text)) { resolve(); return }
    const hasDevanagari = /[\u0900-\u097F]/.test(text)
    const locale = opts.locale || (hasDevanagari ? 'hi-IN' : 'en-US')
    const gender = opts.gender || desiredGender()
    stopAll()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = locale
    u.rate = opts.rate ?? 1.0
    u.pitch = opts.pitch ?? 1.0
    u.volume = opts.volume ?? 1.0
    const v = pickVoice(locale, gender)
    if (v) u.voice = v
    u.onend = () => resolve()
    u.onerror = () => resolve()
    window.speechSynthesis.speak(u)
  })
}

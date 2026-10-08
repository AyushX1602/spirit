/**
 * useSarvamTTS — Sarvam-powered TTS with Web Speech fallback
 *
 * Priority:
 *   1. POST /api/voice/tts  → if {audioBase64} returned, play via Audio element
 *   2. {fallback:'webspeech'} OR any fetch error → Web Speech API
 *
 * Also fixes Web Speech lang selection so Hindi/Indic voices are correctly
 * chosen based on voiceLocale or Devanagari script detection.
 *
 * IMPORTANT: This file MUST NOT import or reference SARVAM_API_KEY.
 */

import { useCallback, useRef } from 'react'
import useOsStore from '../store/osStore'
import { isOnline } from '../lib/connectivity'
import { synthSpeak, claimSpeech, stopAll, setCurrentAudio, effectiveSpeaker, getServerDefaultSpeaker } from '../lib/speechBus'

// ── Locale helpers ────────────────────────────────────────────────────────────

/**
 * Detect whether text or locale warrants Hindi speech synthesis.
 */
function isHindiContext(text = '', locale = '') {
  if (locale && (locale.startsWith('hi') || locale.startsWith('mr') || locale.startsWith('bn')
    || locale.startsWith('ta') || locale.startsWith('te') || locale.startsWith('gu')
    || locale.startsWith('kn') || locale.startsWith('ml') || locale.startsWith('pa')
    || locale.startsWith('ur'))) return true
  // Devanagari unicode range
  if (/[\u0900-\u097F]/.test(text)) return true
  return false
}

/**
 * Pick the best available Web Speech voice for the given locale.
 * Falls back through: exact lang match → base-language match → English.
 */
// ── Web Speech fallback ───────────────────────────────────────────────────────

// Routed through speechBus: cached voices + gender matched to the active Sarvam
// speaker, so a Sarvam->WebSpeech fallback never flips between male and female.
// force:true because speak() already passed the de-dupe gate.
function webSpeakText(text, locale, { rate = 1.0, pitch = 1.0, volume = 1.0 } = {}) {
  return synthSpeak(text, { locale, rate, pitch, volume, force: true })
}

// ── Sarvam Audio playback ─────────────────────────────────────────────────────

function playBase64Audio(audioBase64, mimeType = 'audio/wav') {
  return new Promise((resolve) => {
    try {
      const src  = `data:${mimeType};base64,${audioBase64}`
      const audio = new Audio(src)
      // Register so speechBus.stopAll() can interrupt Sarvam playback too.
      setCurrentAudio(audio)
      audio.onended = () => { setCurrentAudio(null); resolve() }
      audio.onerror = () => { setCurrentAudio(null); resolve() }
      audio.play().catch(() => { setCurrentAudio(null); resolve() })
    } catch (_) {
      resolve()
    }
  })
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export default function useSarvamTTS() {
  const voiceLocale = useOsStore(s => s.voiceLocale)
  const ttsEnabled  = useOsStore(s => s.ttsEnabled)
  const pendingRef  = useRef(null)

  /**
   * Speak text.
   * @param {string} text
   * @param {Object} [opts]
   * @param {string} [opts.languageCode]  - override locale for this call
   * @param {string} [opts.speaker]       - Sarvam speaker id override
   * @param {number} [opts.rate]          - Web Speech rate (fallback only)
   */
  const speak = useCallback(async (text, opts = {}) => {
    if (!text) return

    // De-dupe gate: if the SAME reply was just spoken (command path + live path
    // both fired), skip the duplicate so we don't hear two voices back-to-back.
    if (!claimSpeech(text)) return
    stopAll()

    // Determine effective locale
    const locale = opts.languageCode ||
      (isHindiContext(text, voiceLocale) ? (voiceLocale?.startsWith('en') ? 'hi-IN' : voiceLocale) : voiceLocale) ||
      'en-US'

    // Skip Sarvam when offline OR when user has turned off the AI-assistant voice
    const { preferAssistantVoice } = useOsStore.getState()
    if (isOnline() && preferAssistantVoice !== false) {
      try {
        // Always send a concrete speaker so the server never silently substitutes
        // a different default (the cause of the "shubh vs anushka" mismatch).
        await getServerDefaultSpeaker()
        const speaker = opts.speaker || effectiveSpeaker()

        // 4-second timeout — treat timeout/error as offline signal for this utterance
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)

        const res = await fetch('/api/voice/tts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text, languageCode: locale, speaker, gnaniVoice: speaker }),
          signal:  controller.signal
        })
        clearTimeout(timeoutId)

        if (!res.ok) throw new Error(`TTS HTTP ${res.status}`)
        const data = await res.json()

        if (data.audioBase64) {
          await playBase64Audio(data.audioBase64, data.mimeType || 'audio/wav')
          return
        }
        // { fallback: 'webspeech' } or unexpected response → fall through
      } catch (_) {
        // Network error, timeout, or server not ready — fall through to Web Speech
      }
    }

    // Web Speech fallback
    await webSpeakText(text, locale, { rate: opts.rate || 1.0 })
  }, [voiceLocale])

  /**
   * Announce text — only when TTS is enabled; de-duped at caller site.
   */
  const announce = useCallback(async (text, opts = {}) => {
    if (!ttsEnabled) return
    await speak(text, opts)
  }, [ttsEnabled, speak])

  const cancel = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }, [])

  return { speak, announce, cancel }
}

// ── Standalone helper (matches the speak() export from useTTS.js) ─────────────

/**
 * Fire-and-forget speak, usable outside React (same signature as useTTS.speak).
 * Uses Web Speech only (no Sarvam — this path is for notifications/alerts).
 */
export function speakLocale(text, locale = 'en-US', opts = {}) {
  webSpeakText(text, locale, opts)
}

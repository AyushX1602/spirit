/**
 * useTTS — Text-to-Speech hook for SpiritOS
 *
 * Wraps the browser's Web Speech Synthesis API.
 * - `speak(text)` queues a spoken utterance
 * - `announce(text)` is a convenience wrapper that only fires when TTS is enabled
 * - `cancel()` stops any active speech
 *
 * The hook reads `ttsEnabled` from osStore and is a no-op when disabled.
 */

import { useCallback, useRef } from 'react'
import useOsStore from '../store/osStore'
import { synthSpeak, stopAll } from '../lib/speechBus'

// ---- standalone helpers (usable outside React) ---- //

/**
 * Speak text using the browser Speech Synthesis API.
 * Safe to call even if the API is unavailable.
 *
 * @param {string} text
 * @param {Object} [opts]
 * @param {number} [opts.rate]
 * @param {number} [opts.pitch]
 * @param {number} [opts.volume]
 * @param {string} [opts.lang]      - BCP-47 locale; if omitted, detects from text
 * @param {boolean} [opts.interrupt] - if true, cancels any in-progress utterance
 *                                     before speaking. Default false (queue).
 */
export function speak(text, { rate = 1.0, pitch = 1.0, volume = 1.0, lang, interrupt = false, gender } = {}) {
  // Routed through speechBus so EVERY speech path shares one cached, gender-correct
  // voice AND a de-dupe lock. The de-dupe is what stops the same assistant reply
  // from being spoken twice (once by Sarvam, once by Web Speech) in two voices.
  synthSpeak(text, { locale: lang, rate, pitch, volume, gender })
}

/** Stop any active speech (Web Speech + Sarvam audio). */
export function cancelSpeech() {
  stopAll()
}

// ---- React hook ---- //

export default function useTTS() {
  const ttsEnabled = useOsStore((s) => s.ttsEnabled)
  const lastSpoken = useRef('')
  const lastSpokeAt = useRef(0)

  /**
   * Announce text aloud if TTS is enabled.
   * De-duplicates identical messages within 2 seconds.
   */
  const announce = useCallback(
    (text, opts = {}) => {
      if (!ttsEnabled) return
      if (!text) return

      // De-duplicate rapid-fire identical announcements
      const now = Date.now()
      if (text === lastSpoken.current && now - lastSpokeAt.current < 2000) return
      lastSpoken.current = text
      lastSpokeAt.current = now

      speak(text, opts)
    },
    [ttsEnabled]
  )

  /** Cancel any active speech. */
  const cancel = useCallback(() => {
    cancelSpeech()
  }, [])

  return { announce, cancel, speak, ttsEnabled }
}

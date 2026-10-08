/**
 * useGeminiVoice — Hybrid Voice Mode for SpiritOS
 *
 * Since the Gemini Live API (bidiGenerateContent) is not available on the
 * free-tier API key, this hook uses a hybrid approach:
 *
 *   1. Web Speech API SpeechRecognition → captures mic as text
 *   2. POST /api/agent/chat → sends text to IRIS (Gemini/OpenRouter/Spirit)
 *   3. Web Speech API SpeechSynthesis → speaks the response aloud
 *
 * This gives us natural conversation with full tool-calling support,
 * works offline (browser speech APIs), and is free-tier compatible.
 *
 * When a paid Gemini API key with Live API access is available,
 * swap this for the raw WebSocket audio pipeline (code preserved in git).
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import axios from 'axios'
import useOsStore from '../store/osStore'
import useWindowStore from '../store/windowStore'
import { getDefaultSize } from '../config/appConfig'
import useSarvamTTS from './useSarvamTTS'
import { normalizeIndianVoiceCommand } from '../lib/indianVoiceNormalize'

// ── App name normalizer (mirrors server/lib/irisTools.js canonicalAppName) ──
// Ensures AI-emitted lowercase/abbreviated names resolve to the PascalCase
// keys expected by WindowFrame's app registry.
const _APP_MAP = {
  fileexplorer:'FileExplorer', files:'FileExplorer', filemanager:'FileExplorer', explorer:'FileExplorer',
  terminal:'Terminal', console:'Terminal', cmd:'Terminal',
  calculator:'Calculator', calc:'Calculator',
  notes:'Notes', note:'Notes', notepad:'Notes',
  browser:'Browser', web:'Browser', internet:'Browser',
  settings:'Settings', preferences:'Settings',
  translator:'Translator', translate:'Translator',
  presentation:'Presentation', slides:'Presentation', slideshow:'Presentation',
  reminders:'Reminders', reminder:'Reminders', alarm:'Reminders',
  emergency:'Emergency', sos:'Emergency',
  vault:'Vault', passwords:'Vault',
  mail:'Mail', email:'Mail',
  knownbook:'KnownBook', contacts:'KnownBook',
  pdfviewer:'PdfViewer', pdf:'PdfViewer',
  imageviewer:'ImageViewer', image:'ImageViewer', gallery:'ImageViewer'
}
function canonicalApp(name = '') {
  const key = String(name).toLowerCase().replace(/[\s_\-]/g, '')
  return _APP_MAP[key] || name
}

const VOICE_ACTION_MESSAGES = {
  en: {
    terminal: (command) => `Opening Terminal and running: ${command}.`,
    notesReplace: 'Opening Notes and replacing the note text.',
    notesAdd: 'Opening Notes and adding your text.',
    error: 'Sorry, I encountered an error.'
  },
  hi: {
    terminal: (command) => `Terminal खोलकर "${voiceCommandLabel(command, 'hi')}" चला रहा हूँ.`,
    notesReplace: 'Notes खोलकर नोट का टेक्स्ट बदल रहा हूँ.',
    notesAdd: 'Notes खोलकर आपका टेक्स्ट जोड़ रहा हूँ.',
    error: 'माफ कीजिए, कुछ समस्या आ गई.'
  },
  mr: {
    terminal: (command) => `टर्मिनल उघडतो आणि "${voiceCommandLabel(command, 'mr')}" चालवतो.`,
    notesReplace: 'Notes उघडून नोटमधला मजकूर बदलतो.',
    notesAdd: 'Notes उघडून तुमचा मजकूर जोडतो.',
    error: 'माफ करा, काहीतरी समस्या आली.'
  },
  bn: {
    terminal: (command) => `Terminal খুলে "${voiceCommandLabel(command, 'bn')}" চালাচ্ছি.`,
    notesReplace: 'Notes খুলে নোটের লেখা বদলাচ্ছি.',
    notesAdd: 'Notes খুলে আপনার লেখা যোগ করছি.',
    error: 'দুঃখিত, একটি সমস্যা হয়েছে.'
  },
  ta: {
    terminal: (command) => `Terminal திறந்து "${voiceCommandLabel(command, 'ta')}" இயக்குகிறேன்.`,
    notesReplace: 'Notes திறந்து குறிப்பின் உரையை மாற்றுகிறேன்.',
    notesAdd: 'Notes திறந்து உங்கள் உரையை சேர்க்கிறேன்.',
    error: 'மன்னிக்கவும், ஒரு பிழை ஏற்பட்டது.'
  },
  te: {
    terminal: (command) => `Terminal తెరిచి "${voiceCommandLabel(command, 'te')}" రన్ చేస్తున్నాను.`,
    notesReplace: 'Notes తెరిచి నోట్లోని టెక్స్ట్ మార్చుతున్నాను.',
    notesAdd: 'Notes తెరిచి మీ టెక్స్ట్ జోడిస్తున్నాను.',
    error: 'క్షమించండి, ఒక సమస్య వచ్చింది.'
  },
  gu: {
    terminal: (command) => `Terminal ખોલીને "${voiceCommandLabel(command, 'gu')}" ચલાવું છું.`,
    notesReplace: 'Notes ખોલીને નોટનો લખાણ બદલું છું.',
    notesAdd: 'Notes ખોલીને તમારું લખાણ ઉમેરું છું.',
    error: 'માફ કરશો, કંઈક સમસ્યા આવી.'
  },
  kn: {
    terminal: (command) => `Terminal ತೆರೆಯುತ್ತೇನೆ ಮತ್ತು "${voiceCommandLabel(command, 'kn')}" ಓಡಿಸುತ್ತೇನೆ.`,
    notesReplace: 'Notes ತೆರೆಯುತ್ತೇನೆ ಮತ್ತು ಟಿಪ್ಪಣಿಯ ಪಠ್ಯವನ್ನು ಬದಲಾಯಿಸುತ್ತೇನೆ.',
    notesAdd: 'Notes ತೆರೆಯುತ್ತೇನೆ ಮತ್ತು ನಿಮ್ಮ ಪಠ್ಯವನ್ನು ಸೇರಿಸುತ್ತೇನೆ.',
    error: 'ಕ್ಷಮಿಸಿ, ಒಂದು ಸಮಸ್ಯೆ ಉಂಟಾಯಿತು.'
  },
  ml: {
    terminal: (command) => `Terminal തുറന്ന് "${voiceCommandLabel(command, 'ml')}" പ്രവർത്തിപ്പിക്കുന്നു.`,
    notesReplace: 'Notes തുറന്ന് കുറിപ്പിലെ ടെക്സ്റ്റ് മാറ്റുന്നു.',
    notesAdd: 'Notes തുറന്ന് നിങ്ങളുടെ ടെക്സ്റ്റ് ചേർക്കുന്നു.',
    error: 'ക്ഷമിക്കണം, ഒരു പ്രശ്നം സംഭവിച്ചു.'
  },
  pa: {
    terminal: (command) => `Terminal ਖੋਲ੍ਹ ਕੇ "${voiceCommandLabel(command, 'pa')}" ਚਲਾ ਰਿਹਾ ਹਾਂ.`,
    notesReplace: 'Notes ਖੋਲ੍ਹ ਕੇ ਨੋਟ ਦਾ ਟੈਕਸਟ ਬਦਲ ਰਿਹਾ ਹਾਂ.',
    notesAdd: 'Notes ਖੋਲ੍ਹ ਕੇ ਤੁਹਾਡਾ ਟੈਕਸਟ ਜੋੜ ਰਿਹਾ ਹਾਂ.',
    error: 'ਮਾਫ਼ ਕਰਨਾ, ਕੋਈ ਸਮੱਸਿਆ ਆ ਗਈ.'
  }
}

const VOICE_COMMAND_LABELS = {
  'show my ip address': {
    hi: 'IP पता दिखाओ', mr: 'IP पत्ता दाखव', bn: 'IP ঠিকানা দেখান',
    ta: 'IP முகவரியை காட்டு', te: 'IP చిరునామా చూపించు', gu: 'IP સરનામું બતાવો',
    kn: 'IP ವಿಳಾಸ ತೋರಿಸು', ml: 'IP വിലാസം കാണിക്കുക', pa: 'IP ਪਤਾ ਦਿਖਾਓ'
  },
  'wifi status': {
    hi: 'Wi-Fi स्थिति', mr: 'Wi-Fi स्थिती', bn: 'Wi-Fi অবস্থা',
    ta: 'Wi-Fi நிலை', te: 'Wi-Fi స్థితి', gu: 'Wi-Fi સ્થિતિ',
    kn: 'Wi-Fi ಸ್ಥಿತಿ', ml: 'Wi-Fi നില', pa: 'Wi-Fi ਸਥਿਤੀ'
  },
  battery: {
    hi: 'बैटरी स्थिति', mr: 'बॅटरी स्थिती', bn: 'ব্যাটারি অবস্থা',
    ta: 'பேட்டரி நிலை', te: 'బ్యాటరీ స్థితి', gu: 'બેટરી સ્થિતિ',
    kn: 'ಬ್ಯಾಟರಿ ಸ್ಥಿತಿ', ml: 'ബാറ്ററി നില', pa: 'ਬੈਟਰੀ ਸਥਿਤੀ'
  }
}

function voiceLocaleKey(locale = '') {
  const key = String(locale).split('-')[0].toLowerCase()
  return VOICE_ACTION_MESSAGES[key] ? key : 'en'
}

function voiceCommandLabel(command, localeKey) {
  return VOICE_COMMAND_LABELS[command]?.[localeKey] || command
}

function voiceActionMessage(locale, type, command) {
  const messages = VOICE_ACTION_MESSAGES[voiceLocaleKey(locale)] || VOICE_ACTION_MESSAGES.en
  const value = messages[type]
  return typeof value === 'function' ? value(command) : value
}

function getTerminalVoiceCommand(text = '') {
  const normalized = String(text).toLowerCase()
  const mentionsTerminal = /\b(terminal|console|command prompt|cmd|shell)\b/.test(normalized)
  const terminalTask = [
    { pattern: /\b(my\s+)?ip\s*(address|addr)?\b|\bnetwork\s+info\b/, command: 'show my ip address' },
    { pattern: /\bwifi\s+(status|info|details)\b|\bwireless\b/, command: 'wifi status' },
    { pattern: /\b(open|listening)\s+ports\b|\bnetwork\s+connections\b/, command: 'open ports' },
    { pattern: /\bsystem\s+info\b|\bcomputer\s+info\b|\bspecs\b/, command: 'system info' },
    { pattern: /\bwho\s+am\s+i\b|\bcurrent\s+user\b/, command: 'who am i' },
    { pattern: /\bcomputer\s+name\b|\bhost\s*name\b/, command: 'computer name' },
    { pattern: /\bdisk\s+(space|usage)\b/, command: 'disk space' },
    { pattern: /\b(list|show)\s+files\b/, command: 'list files' },
    { pattern: /\brunning\s+(apps|processes)\b|\btask\s+list\b/, command: 'running apps' },
    { pattern: /\bcpu\s+usage\b/, command: 'cpu usage' },
    { pattern: /\bmemory\s+usage\b|\bram\s+usage\b/, command: 'memory usage' },
    { pattern: /\bbattery\b|\bpower\s+status\b/, command: 'battery' }
  ].find(item => item.pattern.test(normalized))

  const directTerminalRequest = terminalTask && (
    normalized === terminalTask.command ||
    normalized === `${terminalTask.command} status` ||
    normalized.startsWith(`${terminalTask.command} `) ||
    normalized.includes(terminalTask.command) ||
    terminalTask.pattern.test(normalized)
  )

  if (terminalTask && (mentionsTerminal || directTerminalRequest || /\b(find|show|check|tell|get|what)\b/.test(normalized))) {
    return terminalTask.command
  }

  const ping = normalized.match(/\bping\s+([a-z0-9.-]+\.[a-z]{2,}|localhost|[0-9.]+)\b/i)
  if (ping && (mentionsTerminal || /\bcheck\b/.test(normalized))) {
    return `ping ${ping[1]}`
  }

  return null
}

function getNotesVoiceEdit(text = '') {
  const original = String(text).trim()
  const normalized = original.toLowerCase()
  if (!/\b(notes?|notepad)\b/.test(normalized)) return null

  const patterns = [
    { action: 'replace', regex: /\b(?:replace|set)\s+(?:the\s+)?(?:note|notes|notepad)\s+(?:with|to)\s+(.+)$/i },
    { action: 'append', regex: /\b(?:append|add)\s+(.+?)\s+(?:to|in)\s+(?:the\s+)?(?:note|notes|notepad)$/i },
    { action: 'append', regex: /\b(?:in|to)\s+(?:the\s+)?(?:note|notes|notepad)\s+(?:append|add)\s+(.+)$/i },
    { action: 'insert', regex: /\b(?:open\s+)?(?:note|notes|notepad)\s+(?:and\s+)?(?:write|type|insert)\s+(.+)$/i },
    { action: 'insert', regex: /\b(?:write|type|insert)\s+(.+?)\s+(?:in|to)\s+(?:the\s+)?(?:note|notes|notepad)$/i }
  ]

  for (const item of patterns) {
    const match = original.match(item.regex)
    const value = match?.[1]?.trim()
    if (value) return { action: item.action, text: value }
  }

  return null
}

// ── SpeechRecognition polyfill ──────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default function useGeminiVoice() {
  const [isActive, setIsActive] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [transcriptUser, setTranscriptUser] = useState('')
  const [transcriptAI, setTranscriptAI] = useState('')
  const [lastTool, setLastTool] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const isProcessingRef = useRef(false)

  const voiceLocale = useOsStore((state) => state.voiceLocale)

  // ── TTS — routed through Sarvam (with Web Speech fallback) ──────────────
  const { speak: sarvamSpeak } = useSarvamTTS()

  const speakText = useCallback((text, opts = {}) => {
    return sarvamSpeak(text, opts)
  }, [sarvamSpeak])

  const recognitionRef = useRef(null)
  const micStreamRef   = useRef(null)  // holds mic stream so Chrome keeps permission alive
  const isActiveRef    = useRef(false)
  const conversationRef = useRef([]) // rolling context window

  // Sync ref — also set synchronously in start()/stop() for immediate guard
  useEffect(() => { isActiveRef.current = isActive }, [isActive])

  // BUG FIX (STT stuck on old language): the recognizer is created ONCE in start()
  // with a fixed `lang`, so after the user switches language (e.g. Hindi -> English)
  // it keeps decoding the OLD language and shows English speech as Hindi/Devanagari.
  // When voiceLocale changes while listening, update the live recognizer's lang and
  // bounce it (stop -> onend auto-restart) so the new language takes effect at once.
  useEffect(() => {
    const rec = recognitionRef.current
    conversationRef.current = []
    if (!rec || !isActiveRef.current) return
    try {
      rec.lang = voiceLocale || 'en-US'
      rec.stop() // onend handler auto-restarts the recognizer with the new lang
    } catch (_) {}
  }, [voiceLocale])

  // ── Build OS State snapshot for the LLM ───────────────────────────────────

  const buildOsState = useCallback(() => {
    const osState = useOsStore.getState()
    const windows = useWindowStore.getState().windows
    return {
      openWindows: windows.map(w => w.app),
      focusedWindow: windows.find(w => w.focused)?.app || null,
      userName: osState.userName,
      userProfile: osState.profile,
      theme: osState.theme,
      fontSize: osState.fontSize,
      fontWeight: osState.fontWeight,
      contrast: osState.contrast,
      cursorSize: osState.cursorSize,
      gestureEnabled: osState.gestureEnabled,
      voiceEnabled: osState.voiceEnabled,
      eyeTrackingEnabled: osState.eyeTrackingEnabled,
      voiceLocale: osState.voiceLocale    // needed for language-aware responses
    }
  }, [])

  // ── Execute agent action locally ──────────────────────────────────────────

  const executeAgentAction = useCallback((action, meta = {}) => {
    if (!action) return

    const windowStore = useWindowStore.getState()
    const osState = useOsStore.getState()

    console.log('[HybridVoice] Executing action:', action)

    switch (action.action) {
      case 'openApp': {
        const app = canonicalApp(action.target)
        windowStore.openWindow(app, app, getDefaultSize(app))
        break
      }
      case 'openUrl': {
        // Open Browser app, passing the URL as a prop so it auto-navigates
        const app = 'Browser'
        windowStore.openWindow(app, app, getDefaultSize(app), { initialUrl: action.url })
        break
      }
      case 'closeApp': {
        const appName = canonicalApp(action.target)
        const targetWin = windowStore.windows.find(w => w.app === appName)
        if (targetWin) {
          windowStore.closeWindow(targetWin.id)
        } else {
          // fallback: close focused window
          const focused = windowStore.windows.find(w => w.focused)
          if (focused) windowStore.closeWindow(focused.id)
        }
        break
      }
      case 'switchWindow': {
        const target = windowStore.windows.find(w => w.app === canonicalApp(action.target))
        if (target) windowStore.focusWindow(target.id)
        break
      }
      case 'nextWindow':     windowStore.focusNextWindow(); break
      case 'previousWindow': windowStore.focusPrevWindow(); break
      case 'showDesktop':
        windowStore.windows.forEach((w) => windowStore.minimizeWindow(w.id))
        break
      case 'applyProfile':
        osState.applyProfile(action.target)
        break
      case 'changeSetting':
        if (action.target === 'theme')      osState.setTheme(action.value)
        if (action.target === 'fontSize')   osState.setFontSize(action.value)
        if (action.target === 'fontWeight') osState.setFontWeight(action.value)
        if (action.target === 'gestureEnabled')
          osState.setGestureEnabled(action.value === true || action.value === 'true')
        if (action.target === 'voiceEnabled')
          osState.setVoiceEnabled(action.value === true || action.value === 'true')
        if (action.target === 'contrast')
          osState.setContrast(action.value)
        if (action.target === 'cursorSize')
          osState.setCursorSize(action.value)
        if (action.target === 'ttsEnabled')
          osState.setTTSEnabled(action.value === true || action.value === 'true')
        if (action.target === 'eyeTrackingEnabled')
          osState.setEyeTrackingEnabled(action.value === true || action.value === 'true')
        if (action.target === 'visualAlertsEnabled')
          osState.setVisualAlertsEnabled(action.value === true || action.value === 'true')
        break
      case 'minimizeWindow': {
        const focused = windowStore.windows.find(w => w.focused)
        if (focused) windowStore.minimizeWindow(focused.id)
        break
      }
      case 'maximizeWindow': {
        const focused = windowStore.windows.find(w => w.focused)
        if (focused) windowStore.maximizeWindow(focused.id)
        break
      }
      case 'createReminder':
        if (meta.source === 'spirit') {
          window.dispatchEvent(new CustomEvent('spiritos:reminders-changed'))
          break
        }
        if (action.title && /^\d{2}:\d{2}$/.test(action.timeOfDay || '')) {
          axios.post('/api/reminders', {
            title:      action.title,
            timeOfDay:  action.timeOfDay,
            daysMask:   action.daysMask || '1111111',
            enabled:    true,
            speakAloud: true
          }).then(() => {
            window.dispatchEvent(new CustomEvent('spiritos:reminders-changed'))
          }).catch((err) => console.warn('[HybridVoice] createReminder failed:', err.message))
        }
        break
      case 'deleteReminder':
        axios.get('/api/reminders').then(({ data }) => {
          const needle = (action.match || '').toLowerCase()
          const target = needle
            ? (data || []).find((r) => r.title.toLowerCase().includes(needle))
            : (data || [])[0]
          if (target) {
            return axios.delete(`/api/reminders/${target.id}`).then(() => {
              window.dispatchEvent(new CustomEvent('spiritos:reminders-changed'))
            })
          }
        }).catch(() => {})
        break
      case 'triggerSOS':
        window.dispatchEvent(new CustomEvent('spiritos:sos'))
        break
      case 'openWebsite':
        if (action.url) window.open(action.url, '_blank', 'noopener,noreferrer')
        break
      case 'search':
        if (action.query) {
          window.open(
            `https://www.google.com/search?q=${encodeURIComponent(action.query)}`,
            '_blank', 'noopener,noreferrer'
          )
        }
        break
      case 'translate':
        windowStore.openWindow('Translator', 'Translator', getDefaultSize('Translator'))
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('spiritos:translate', {
            detail: { text: action.text, targetLang: action.target }
          }))
        }, 150)
        break
      default:
        break
    }
  }, [])

  // ── Process a user utterance through IRIS ─────────────────────────────────

  const openTerminalAndRun = useCallback((command) => {
    if (!command) return
    const windowStore = useWindowStore.getState()
    windowStore.openWindow('Terminal', 'Terminal', getDefaultSize('Terminal'))

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('spiritos:terminal-run', {
        detail: { input: command, source: 'voice' }
      }))
    }, 250)
  }, [])

  const openNotesAndEdit = useCallback((edit) => {
    if (!edit?.text) return
    const windowStore = useWindowStore.getState()
    windowStore.openWindow('Notes', 'Notes', getDefaultSize('Notes'))

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('spiritos:notes-edit', {
        detail: edit
      }))
    }, 250)
  }, [])

  const processUtterance = useCallback(async (text) => {
    if (!text.trim()) return
    const currentLocale = useOsStore.getState().voiceLocale
    const commandText = normalizeIndianVoiceCommand(text, currentLocale)

    setTranscriptUser(text)
    setIsProcessing(true)
    setTranscriptAI('')
    setLastTool(null)

    // Add to conversation context
    conversationRef.current.push({ role: 'user', content: text })
    // Keep last 10 messages for context
    if (conversationRef.current.length > 10) {
      conversationRef.current = conversationRef.current.slice(-10)
    }

    try {
      console.log('[HybridVoice] Sending to IRIS:', text)

      const response = await axios.post('/api/agent/chat', {
        message: commandText,
        osState: {
          ...buildOsState(),
          originalUtterance: text,
          normalizedUtterance: commandText,
          sessionHistory: conversationRef.current.slice(0, -1) // exclude current message
        }
      })

      const terminalCommand = getTerminalVoiceCommand(commandText)
      const notesEdit = getNotesVoiceEdit(commandText)
      let aiText = response.data?.message || response.data?.reply || "I didn't get a response."
      const action = response.data?.action
      const source = response.data?.source || response.data?.agent
      const toolsUsed = response.data?.toolsUsed || []
      const agents = response.data?.agents || []

      // If a reminder tool was run, trigger UI refresh
      if (agents.some(a => a && a.includes('reminder'))) {
        window.dispatchEvent(new CustomEvent('spiritos:reminders-changed'))
      }

      // Show tool usage
      if (toolsUsed.length > 0) {
        setLastTool({ status: 'done', tool: toolsUsed.map(t => t.name || t).join(', ') })
      }

      if (terminalCommand) {
        aiText = voiceActionMessage(currentLocale, 'terminal', terminalCommand)
      } else if (notesEdit) {
        aiText = voiceActionMessage(
          currentLocale,
          notesEdit.action === 'replace' ? 'notesReplace' : 'notesAdd'
        )
      }

      // Update transcript
      setTranscriptAI(aiText)

      // Add AI response to conversation context
      conversationRef.current.push({ role: 'assistant', content: aiText })

      console.log('[HybridVoice] IRIS response:', aiText.substring(0, 100))

      // Execute action if any returned by agent
      if (terminalCommand) {
        openTerminalAndRun(terminalCommand)
      } else if (notesEdit) {
        openNotesAndEdit(notesEdit)
      } else if (action) {
        executeAgentAction(action, { source })
      }

      // Speak the response aloud
      await speakText(aiText, { languageCode: currentLocale })

    } catch (err) {
      console.error('[HybridVoice] IRIS error:', err)
      const errMsg = err.response?.data?.error || err.message || 'Something went wrong'
      setTranscriptAI(`Error: ${errMsg}`)
      setError(errMsg)
      await speakText(
        voiceActionMessage(useOsStore.getState().voiceLocale, 'error'),
        { languageCode: useOsStore.getState().voiceLocale }
      )
    } finally {
      setIsProcessing(false)
      isProcessingRef.current = false
    }
  }, [speakText, buildOsState, executeAgentAction, openTerminalAndRun, openNotesAndEdit])

  // ── Start continuous voice conversation ───────────────────────────────────

  const start = useCallback(async () => {
    if (isActiveRef.current) {
      console.log('[HybridVoice] Already active')
      return
    }
    // Set synchronously so a second rapid call is blocked even before onstart fires
    isActiveRef.current = true

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser')
      return
    }

    setError(null)
    setTranscriptUser('')
    setTranscriptAI('')
    setLastTool(null)
    conversationRef.current = []

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous    = true
      recognition.interimResults = true
      recognition.lang           = useOsStore.getState().voiceLocale || 'en-US'
      recognition.maxAlternatives = 1

      recognitionRef.current = recognition

      let silenceTimer = null

      recognition.onstart = () => {
        console.log('[HybridVoice] STT started — speak now')
        setIsActive(true)
        setIsReady(true)
      }

      recognition.onresult = (event) => {
        let interim = ''
        let localFinalTranscript = ''

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            localFinalTranscript += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }

        // Show interim/final transcript to user
        const fullUserText = (localFinalTranscript + ' ' + interim).trim()
        if (fullUserText) {
          setTranscriptUser(fullUserText)
        }

        if (localFinalTranscript.trim()) {
          // Clear any existing timer
          if (silenceTimer) clearTimeout(silenceTimer)

          const textToProcess = localFinalTranscript.trim()

          // Wait 800ms of silence before processing (allows multi-sentence input)
          silenceTimer = setTimeout(() => {
            if (isActiveRef.current) {
              // Pause recognition while processing
              isProcessingRef.current = true
              setIsProcessing(true)
              try { recognition.stop() } catch (_) {}

              processUtterance(textToProcess).then(() => {
                isProcessingRef.current = false
                setIsProcessing(false)
                // Resume listening after TTS finishes
                if (isActiveRef.current) {
                  try { recognition.start() } catch (_) {}
                }
              })
            }
          }, 800)
        }
      }

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          console.error('[HybridVoice] STT error:', event.error)
          setError('Microphone access denied')
          setIsActive(false)
          setIsReady(false)
        } else if (event.error === 'no-speech') {
          console.debug('[HybridVoice] STT no speech detected')
          // Normal — just means silence, will auto-restart
        } else if (event.error === 'aborted') {
          // We aborted it ourselves, ignore
        } else {
          console.error('[HybridVoice] STT error:', event.error)
          setError(`Speech error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        // Auto-restart if still active (handles browser auto-stop)
        if (isActiveRef.current && !isProcessingRef.current) {
          try {
            setTimeout(() => {
              if (isActiveRef.current) {
                recognition.start()
              }
            }, 300) // Increase delay to avoid rapid rate-limit block
          } catch (_) {}
        }
      }

      // CRITICAL: explicitly acquire mic before recognition.start().
      // After commands-mode cleanup stops its MediaStream, Chrome requires
      // a fresh getUserMedia grant — calling recognition.start() alone gives
      // a silent "not-allowed" or no onresult events on the next call.
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          micStreamRef.current = stream
          if (!isActiveRef.current) {
            // Was stopped before getUserMedia resolved
            stream.getTracks().forEach(t => t.stop())
            micStreamRef.current = null
            return
          }
          try {
            recognition.start()
          } catch (err) {
            console.error('[HybridVoice] recognition.start() threw:', err)
            isActiveRef.current = false
            setIsActive(false)
            setIsReady(false)
          }
        })
        .catch((err) => {
          console.error('[HybridVoice] getUserMedia failed:', err)
          isActiveRef.current = false
          setError('Microphone access denied')
          setIsActive(false)
          setIsReady(false)
        })

      // Pre-load voices
      window.speechSynthesis?.getVoices()

    } catch (err) {
      isActiveRef.current = false
      setError(err.message)
      console.error('[HybridVoice] Start error:', err)
    }
  }, [processUtterance])

  // ── Stop voice session ──────────────────────────────────────────────────

  const stop = useCallback(() => {
    console.log('[HybridVoice] Stopping')

    isActiveRef.current = false

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }

    // Cancel any ongoing TTS
    window.speechSynthesis?.cancel()

    setIsActive(false)
    setIsReady(false)
    setTranscriptUser('')
    setTranscriptAI('')
    setLastTool(null)
    setIsProcessing(false)
    conversationRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => { stop() }
  }, [stop])

  return {
    start,
    stop,
    isActive,
    isReady,
    transcriptUser,
    transcriptAI,
    lastTool,
    error,
    isProcessing
  }
}

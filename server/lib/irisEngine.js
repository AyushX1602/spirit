/**
 * server/lib/irisEngine.js — Triple-Engine Router
 *
 * The keystone of the IRIS integration. Routes user input through:
 *   1. IRIS engine (Gemini + function-calling) — primary
 *   2. OpenRouter (free LLM models) — fallback tier 1
 *   3. Spirit engine (existing offline NLP) — fallback tier 2
 *
 * Fallback chain:
 *   - Gemini fails/timeout → try OpenRouter free models
 *   - OpenRouter fails/unavailable → Spirit offline engine
 *   - Spirit fails → error message
 *
 * Architecture:
 *   userInput ──▶ irisEngine.process(input)
 *                     │
 *                     ├── Try: Gemini tool-calling (timeout)
 *                     │     ├── Success → { source: 'iris', result }
 *                     │     └── Error/Timeout ──┐
 *                     │                         │
 *                     ├── Try: OpenRouter free models
 *                     │     ├── Success → { source: 'openrouter', result }
 *                     │     └── Fail ──┐
 *                     │                │
 *                     └── Fallback: Spirit engine
 *                           └── { source: 'spirit', result }
 */

const { GoogleGenerativeAI } = require('@google/generative-ai')
const { toolRegistry, toolDeclarations } = require('./irisTools')
const { spirit } = require('./spirit')
const { normalizeIndianVoiceCommand } = require('./indianVoiceNormalize')
const { chatWithOpenRouter, isOpenRouterAvailable, getOpenRouterStatus } = require('./openRouterClient')
const { chatWithGroq, isGroqAvailable } = require('./groqClient')
const { chatWithOpenAI, isOpenAIAvailable } = require('./openAIClient')
const { isSarvamEnabled, sarvamChat, SarvamDisabledError } = require('./sarvam')
const { executeToolCalls, summarizeOutcome } = require('./toolProtocol')
const memoryService = require('./memory')
const _process = require('process')  // Reliable ref — avoids Node 24 CJS scope quirks

// ── Configuration (deferred to avoid module-init-order issues) ──────────────

function getFallbackTimeout() {
  return parseInt(_process.env.AI_FALLBACK_TIMEOUT_MS || '8000')
}
function getPrimaryEngine() {
  return _process.env.AI_PRIMARY_ENGINE || 'iris'
}

// ── Gemini model fallback chain ─────────────────────────────────────────────
// Each model has independent rate-limit quotas on the free tier.
// We try them in order; if one is 429'd we cache that and skip it next time.

// SPEED FIX: try the fastest models FIRST. gemini-2.5-flash is the slowest to
// respond (more reasoning), so it was making every reply feel laggy; we now use
// it only as a last resort. 2.0-flash-lite has the lowest latency.
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',   // lowest latency, separate quota
  'gemini-2.0-flash',        // primary workhorse
  'gemini-2.5-flash',        // slowest; last resort
]

let genAI = null

// Cache 429 status per model (model → timestamp). Cooldown: 5 minutes.
const gemini429Cache = new Map()
const GEMINI_429_COOLDOWN = 5 * 60 * 1000

function isGeminiModelAvailable(modelName) {
  const ts = gemini429Cache.get(modelName)
  if (!ts) return true
  if (Date.now() - ts > GEMINI_429_COOLDOWN) {
    gemini429Cache.delete(modelName)
    return true
  }
  return false
}

function getGenAI() {
  if (genAI) return genAI
  const apiKey = _process.env.GEMINI_API_KEY
  if (!apiKey) return null
  genAI = new GoogleGenerativeAI(apiKey)
  return genAI
}

function createModel(modelName, context) {
  const ai = getGenAI()
  if (!ai) return null
  return ai.getGenerativeModel({
    model: modelName,
    tools: [{ functionDeclarations: toolDeclarations }],
    systemInstruction: buildSystemPrompt(context)
  })
}

// ── Language naturalness instruction (appended to ALL engine prompts) ────────
// Gender is read from SARVAM_TTS_SPEAKER at startup so it matches the voice.
// Male speakers: shubh, aditya, rahul, rohan, amit, dev, kabir, mani, mohit, rehan, soham
// Female speakers: anushka, manisha, vidya, arya, priya, ritu, neha, pooja, simran, kavya, ...

const _MALE_SPEAKERS = new Set([
  'shubh','aditya','rahul','rohan','amit','dev','kabir','mani','mohit',
  'rehan','soham','abhilash','karun','hitesh','ratan','varun','manan',
  'sumit','aayan','ashutosh','advait','anand','tarun','sunny','gokul','vijay'
])

function _isMaleSpeaker() {
  const spk = (_process.env.SARVAM_TTS_SPEAKER || '').toLowerCase().trim()
  return _MALE_SPEAKERS.has(spk)
}

function buildGenderInstruction() {
  if (_isMaleSpeaker()) {
    return `\n\nIMPORTANT — Gender: You are IRIS, a male AI assistant. When speaking in Hindi, use masculine grammatical forms. Use masculine past tense: "किया", "गया", "बनाया". Say "मैं यहाँ हूँ आपकी मदद के लिए" naturally as a man would. Speak as a warm, direct, helpful man.`
  }
  return `\n\nIMPORTANT — Gender: You are IRIS, a female AI assistant. When speaking in Hindi, always use feminine grammatical forms. Use "की", "गई" over masculine "किया", "गया". Speak as a warm, helpful woman.`
}

const LANGUAGE_INSTRUCTION = `\n\nAlways reply in the same language the user used. When replying in Hindi or Hinglish, use natural, everyday conversational Hindi (Devanagari or Roman as the user did) — never stiff, formal, or over-Sanskritized wording. Keep replies short and spoken-friendly.` + buildGenderInstruction()

const INDIC_SCRIPT_RE = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/
const LOCALE_SCRIPT_RE = {
  hi: /[\u0900-\u097F]/,
  mr: /[\u0900-\u097F]/,
  bn: /[\u0980-\u09FF]/,
  pa: /[\u0A00-\u0A7F]/,
  gu: /[\u0A80-\u0AFF]/,
  ta: /[\u0B80-\u0BFF]/,
  te: /[\u0C00-\u0C7F]/,
  kn: /[\u0C80-\u0CFF]/,
  ml: /[\u0D00-\u0D7F]/
}

function localeKey(locale = '') {
  return String(locale || '').split('-')[0].toLowerCase()
}

function currentVoiceLocale(context) {
  return context?.voiceLocale || context?.osState?.voiceLocale || ''
}

function localActionCandidate(message, context) {
  const locale = currentVoiceLocale(context)
  const normalized = normalizeIndianVoiceCommand(message, locale)
  const candidate = normalized || message

  const command = candidate.toLowerCase()
  const isLocal =
    /^set a reminder\b/.test(command) ||
    /^open\s+/.test(command) ||
    /^close\s+/.test(command) ||
    /^switch to\s+/.test(command) ||
    /^what (?:time|date)\b/.test(command) ||
    /^battery status\b/.test(command) ||
    /^call for help\b/.test(command) ||
    /^search\s+/.test(command)

  return isLocal ? candidate : null
}

function historyMatchesLocale(turn, locale) {
  const key = localeKey(locale)
  if (!key) return true
  const turnLocale = localeKey(turn?.locale)
  if (turnLocale) return turnLocale === key

  const text = String(turn?.content || '')
  if (!text) return false
  if (key === 'en') return !INDIC_SCRIPT_RE.test(text)

  const scriptRe = LOCALE_SCRIPT_RE[key]
  if (!scriptRe) return true
  if (INDIC_SCRIPT_RE.test(text)) return scriptRe.test(text)

  // Keep Latin-script user commands for context, but do not let an old
  // English assistant answer pull the next response away from the selected
  // Indic language.
  return turn?.role !== 'assistant'
}

/**
 * Build a language-specific instruction based on the user's voiceLocale setting.
 * This ensures IRIS responds in the correct language even when the user message is in English.
 */
function buildLanguageInstruction(context) {
  const locale = currentVoiceLocale(context)
  if (!locale || locale.startsWith('en')) {
    return `${LANGUAGE_INSTRUCTION}\n\nThe user's preferred language is English. Always respond in clear, natural English, even if older conversation history contains another language.`
  }

  const LOCALE_NAMES = {
    'hi-IN': 'Hindi (हिन्दी)',
    'mr-IN': 'Marathi (मराठी)',
    'bn-IN': 'Bengali (বাংলা)',
    'ta-IN': 'Tamil (தமிழ்)',
    'te-IN': 'Telugu (తెలుగు)',
    'gu-IN': 'Gujarati (ગુજરાતી)',
    'kn-IN': 'Kannada (ಕನ್ನಡ)',
    'ml-IN': 'Malayalam (മലയാളം)',
    'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
  }
  const langName = LOCALE_NAMES[locale] || locale
  return `${LANGUAGE_INSTRUCTION}\n\nThe user's preferred language is ${langName}. Always respond in ${langName}, even if the user wrote in English. Use natural, conversational ${langName} — not translated English. Keep responses short and spoken-friendly.`
}

function buildSystemPrompt(context) {
  const osState = context?.osState || {}
  const openApps = osState.openWindows?.length
    ? `Currently open: ${osState.openWindows.join(', ')}`
    : 'No apps open'

  return `You are IRIS — the fully capable AI brain of SpiritOS, a web-based accessible operating system.

## Your Identity
You are a powerful, proactive assistant. You DO things — you don't just describe how to do them.
When a user asks you to do something the OS supports, USE THE APPROPRIATE TOOL immediately.
Do NOT explain what you would do — just do it and confirm briefly.

## OS State
- Filesystem root: ${_process.env.FS_ROOT || 'user home directory'}
- ${openApps}
- Focused: ${osState.focusedWindow || 'none'}

## Full OS Capabilities — You Can Do ALL of These

### 🗂 File & Folder Management
- Create, read, write, delete, rename, move, copy files and folders
- Search files by name or content (semantic search)
- Read file contents (text, code, markdown, json, yaml, etc.)
- Index directories for semantic search
- Open images, PDFs, text files in the appropriate viewer

### 💻 App Control
- Open ANY of these apps: FileExplorer, Terminal, Calculator, Notes, Browser, Settings,
  Translator, Presentation, Reminders, KnownBook, Vault, Mail, Emergency
- Close any open app or the currently focused window
- open_url: open the Browser to a specific URL (YouTube, Google, any website)

### 🌐 Web & Information
- Search the web for real-time info (news, prices, sports, facts, weather) via google_search
- Get weather for any city via weather_report
- Translate text between 25+ languages via the Translator app

### ⏰ Reminders & Scheduling
- Create medication/task reminders with time, repeat schedule
- List all reminders
- Delete reminders by name or ID
- Schedule one-time tasks to run at a future time

### 🧠 Memory & Personalization
- Remember personal facts about the user (name, preferences, relationships, plans) via save_memory
- Recall memories by category or key via recall_memory
- User profile and Known Book are already injected into your context

### 📝 Notes
- Save notes by title and content
- Read/list all saved notes

### 🔐 Vault (Encrypted)
- Unlock the secure vault with a PIN
- Add, retrieve, list, delete secrets (passwords, PINs, medical info, etc.)

### 🤖 Automation & Workflows
- Create named automation workflows (sequences of: open app, run command, notify)
- List, run, delete workflows
- Schedule shell commands for future execution
- List and cancel scheduled tasks

### 🖥 System & Terminal
- Run safe shell commands (ipconfig, ping, dir, tasklist, etc.)
- If the user says "open terminal and ..." or asks Terminal to find/show/check system info, use open_app for Terminal AND run_terminal for the requested command.
- For IP address requests, use run_terminal with "ipconfig" on Windows.
- Screen capture and OCR (read text from screen or images)
- Analyze images with AI vision
- Parse documents (PDF, DOCX, HTML) to extract text

### 🎨 UI & Accessibility
- Change theme (light/dark), font size, contrast
- Apply accessibility profiles (elderly, visually-impaired, motor-impaired, beginner)
- Any OS setting can be changed via changeSetting action

## Decision Rules
1. User wants something DONE → use a tool, then confirm in 1 sentence
2. User asks a question → answer directly, use google_search if real-time info needed
3. User shares personal info → silently call save_memory, keep conversation flowing
4. Destructive action (delete, format) → confirm first with a brief question
5. Multi-step requests → chain tool calls in sequence; tell the user what you did

6. Do not stop after opening an app if the same sentence also asks you to type, run, edit, create, or change something inside it.

## Indian Language Command Examples
The language selected in Settings is the command language. Interpret Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, and Punjabi commands as OS actions.
- App open phrases like "नोट्स उघड", "নোট খুলুন", "நோட்ஸ் திற", "నోట్స్ తెరువు", "નોટ્સ ખોલો", "ನೋಟ್ಸ್ ತೆರೆಯಿರಿ", "നോട്ട് തുറക്കൂ", or "ਨੋਟ ਖੋਲ੍ਹੋ" mean open_app Notes.
- Theme phrases like "डार्क मोड लाव", "ডার্ক মোড চালু করুন", or "ડાર્ક મોડ ચાલુ કરો" mean change theme to dark.
- Terminal/IP phrases like "टर्मिनल उघडून IP दाखव", "টার্মিনাল খুলে IP দেখান", or "ਟਰਮੀਨਲ ਖੋਲ੍ਹ ਕੇ IP ਦਿਖਾਓ" mean open Terminal and run ipconfig.
- Reminder phrases with a time mean create a reminder.

## Tool Action Convention
When a tool returns { action: 'openApp', target: 'Notes' } — include it in your response.
The frontend automatically executes it. You don't need to "navigate" manually.

## Style
- Be direct and capable — "Done, created the file notes.txt" not "I would create..."
- 1-2 sentences max unless the user asks for detail
- Use the user's language (Hindi, Marathi, etc. if that's their locale)

CRITICAL: To perform ANY action (create/edit/delete/move files, open apps, set reminders, run commands, save notes/memory), you MUST use the appropriate function tool call. NEVER say something is done, created, opened, or saved unless you actually called a tool for it in THIS response. If you cannot do it, say so plainly. Do not describe actions as completed that you did not call a tool for.` + buildLanguageInstruction(context)
}

// ── Load persistent memory into context ─────────────────────────────────────
// Legacy local JSON reader (kept for backward compat with data/memory.json)
function loadMemoryContext(userName) {
  try {
    const fs = require('fs')
    const memPath = require('path').join(__dirname, '..', 'data', 'memory.json')
    const raw = JSON.parse(fs.readFileSync(memPath, 'utf-8'))

    // Support both per-user { "<userName>": { ...categories } }
    // and legacy flat { ...categories } formats.
    const mem = (userName && raw[userName] && typeof raw[userName] === 'object' && !raw[userName].value)
      ? raw[userName]
      : (raw._global || raw)   // fallback: _global key or legacy flat

    const categories = Object.entries(mem)
    if (!categories.length) return ''

    const lines = []
    for (const [cat, entries] of categories) {
      // Skip user-name keys and metadata keys
      if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) continue
      for (const [key, val] of Object.entries(entries)) {
        if (val && typeof val === 'object' && val.value !== undefined) {
          lines.push(`- [${cat}] ${key}: ${val.value}`)
        }
      }
    }
    if (!lines.length) return ''
    return `\n\nPersistent memories:\n${lines.join('\n')}`
  } catch (_) {
    return ''
  }
}

/**
 * Fetch Mem0 long-term memories for a user and format them as a prompt section.
 * Returns '' if empty or on any error — never throws.
 * @param {string} userId
 * @param {string} query
 * @returns {Promise<string>}
 */
async function loadMem0Context(userId, query) {
  if (!userId) return ''
  try {
    const memories = await memoryService.searchMemories(userId, query, 6)
    if (!memories.length) return ''
    const lines = memories.map(m => `- ${m.memory || JSON.stringify(m)}`)
    return `\n\nKnown about this user (from long-term memory):\n${lines.join('\n')}`
  } catch (_) {
    return ''
  }
}

/**
 * After a completed IRIS interaction, extract durable facts and save to Mem0.
 * Fire-and-forget — never blocks the caller.
 * @param {string} userId
 * @param {string} userMessage
 * @param {string} assistantReply
 */
function extractAndSaveMemories(userId, userMessage, assistantReply) {
  if (!userId) return
  // Extract patterns: name, preference, language choice, app mentions, relationships
  const combined = `User said: ${userMessage}\nAssistant replied: ${assistantReply}`
  const patterns = [
    { re: /my name is ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i,  prefix: 'User name: ' },
    { re: /i(?:'m| am) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i, prefix: 'User is: ' },
    { re: /i (?:prefer|like|love|use) (.{4,60})/i,        prefix: 'Preference: ' },
    { re: /(?:call me|known as) ([A-Za-z]+)/i,            prefix: 'Preferred name: ' },
    { re: /(?:my|the) language (?:is |to )([a-zA-Z]+)/i,  prefix: 'Language: ' },
    { re: /(?:open|use) (\w+) (?:a lot|often|frequently)/i, prefix: 'Frequent app: ' },
  ]
  const facts = []
  for (const { re, prefix } of patterns) {
    const m = combined.match(re)
    if (m) facts.push(prefix + m[1])
  }
  if (!facts.length) return
  // Fire-and-forget — async, never awaited by caller
  const text = facts.join('. ')
  memoryService.addMemory(userId, text, { auto: true }).catch(() => {})
}

// ── Shared session-history helpers ───────────────────────────────────────────
// Used by all three engines so the load/persist logic lives in one place.

/**
 * Load the last N turns from AgentSession for the current session.
 * Returns [] on any error (non-fatal — a missing DB row is fine).
 * @param {Object} context – { sessionId, prisma }
 * @param {number} [limit=20]
 * @returns {Promise<Array<{role:string, content:string}>>}
 */
async function loadSessionHistory(context, limit = 20) {
  const locale = currentVoiceLocale(context)
  if (Array.isArray(context?.history)) {
    return context.history.filter(turn => historyMatchesLocale(turn, locale)).slice(-limit)
  }
  if (!context?.sessionId || !context?.prisma) return []
  try {
    const session = await context.prisma.agentSession.upsert({
      where:  { sessionId: context.sessionId },
      create: { sessionId: context.sessionId, history: '[]' },
      update: {}
    })
    const blob = JSON.parse(session.history || '[]')
    // Handle bare array (current format) and legacy {history,pending} object
    const arr = Array.isArray(blob) ? blob : (Array.isArray(blob?.history) ? blob.history : [])
    return arr.filter(turn => historyMatchesLocale(turn, locale)).slice(-limit)
  } catch (_) {
    return []
  }
}

/**
 * Append one user+assistant turn to AgentSession (fire-and-forget).
 * Keeps the stored history capped at 40 turns.
 * @param {Object} context       – { sessionId, prisma }
 * @param {string} userMsg       – raw user message (no OS-state prefix)
 * @param {string} assistantMsg  – final assistant reply text
 * @param {Array}  currentHistory – the history array already loaded this turn
 */
function persistTurn(context, userMsg, assistantMsg, currentHistory = []) {
  if (!context?.sessionId || !context?.prisma) return
  const locale = currentVoiceLocale(context)
  const newHistory = [
    ...currentHistory,
    { role: 'user',      content: userMsg,      locale },
    { role: 'assistant', content: assistantMsg, locale }
  ].slice(-40)
  context.prisma.agentSession.upsert({
    where:  { sessionId: context.sessionId },
    create: { sessionId: context.sessionId, history: JSON.stringify(newHistory) },
    update: { history: JSON.stringify(newHistory) }
  }).catch(e => console.warn('[IrisEngine] persistTurn failed (non-fatal):', e.message))
}

// ── Per-user context: UserProfile + Known Book ───────────────────────────────

/**
 * Load the user's profile and Known Book people from the DB.
 * Returns a compact text block for injection into all engine prompts.
 * Returns '' on any error (non-fatal).
 * @param {Object} context – { sessionId, prisma }
 * @returns {Promise<string>}
 */
async function loadUserContext(context) {
  if (!context?.sessionId || !context?.prisma) return ''
  try {
    const lines = []

    // UserProfile
    const profile = await context.prisma.userProfile.findUnique({
      where: { userName: context.sessionId }
    })
    if (profile) {
      lines.push(`About the user:`)
      lines.push(`- Name: ${profile.userName}`)
      if (profile.profileName) lines.push(`- Accessibility profile: ${profile.profileName}`)
      if (profile.customSettings) {
        try {
          const cs = JSON.parse(profile.customSettings)
          const csStr = Object.entries(cs).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(', ')
          if (csStr) lines.push(`- Preferences: ${csStr}`)
        } catch (_) {}
      }
    }

    // Known Book
    const people = await context.prisma.knownPerson.findMany({
      where: { userId: context.sessionId },
      take: 20,
      orderBy: { createdAt: 'asc' }
    })
    if (people.length > 0) {
      lines.push(`People they know (Known Book):`)
      for (const p of people) {
        const note = p.notes ? `: ${p.notes}` : ''
        lines.push(`- ${p.name} (${p.relationship || 'known person'})${note}`)
      }
    }

    if (lines.length === 0) return ''
    return `\n\n${lines.join('\n')}`
  } catch (_) {
    return ''
  }
}

// ── IRIS Engine (Gemini + tool calling) ─────────────────────────────────────

async function processWithIris(message, context, signal) {
  if (!getGenAI()) throw new Error('NO_API_KEY')

  // ── Load conversation history + user context (shared helpers) ───────────
  const chatHistory = await loadSessionHistory(context, 20)
  const userCtx     = await loadUserContext(context)

  // Build the user message with optional OS state context
  let userMsg = message
  if (context.osState) {
    const state = context.osState
    const ctxParts = []
    if (state.openWindows?.length) ctxParts.push(`Open apps: ${state.openWindows.join(', ')}`)
    if (state.focusedWindow) ctxParts.push(`Focused: ${state.focusedWindow}`)
    if (state.theme) ctxParts.push(`Theme: ${state.theme}`)
    if (state.userName) ctxParts.push(`User: ${state.userName}`)
    if (ctxParts.length) userMsg = `[OS State: ${ctxParts.join(' | ')}]\n\n${message}`
  }

  // Append memory context (Mem0 long-term + legacy local) + user profile/known book
  const [mem0Ctx, legacyMemCtx] = await Promise.all([
    loadMem0Context(context.sessionId, message),
    Promise.resolve(loadMemoryContext(context.sessionId))
  ])
  if (mem0Ctx)      userMsg += mem0Ctx
  if (legacyMemCtx) userMsg += legacyMemCtx
  if (userCtx)      userMsg += userCtx

  // Try each Gemini model until one succeeds
  let lastError = null
  for (const modelName of GEMINI_MODELS) {
    if (signal?.aborted) throw new Error('IRIS_ABORTED')
    if (!isGeminiModelAvailable(modelName)) {
      console.log(`[IrisEngine] Skipping ${modelName} (429 cached)`)
      continue
    }

    try {
      console.log(`[IrisEngine] Trying Gemini model: ${modelName}`)
      const gemini = createModel(modelName, context)

      // Use chat mode so history is threaded into the request
      const geminiHistory = chatHistory.map(turn => ({
        role:  turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.content }]
      }))
      const chat   = gemini.startChat({ history: geminiHistory })
      const result = await chat.sendMessage(userMsg)
      if (signal?.aborted) throw new Error('IRIS_ABORTED')
      const response = result.response
      const candidate = response.candidates?.[0]

      if (!candidate) throw new Error('No response from Gemini')

      // Check for function calls
      const parts = candidate.content?.parts || []
      const functionCalls = parts.filter(p => p.functionCall)

      if (functionCalls.length > 0) {
        // Execute tool calls
        const toolResults = []
        let frontendAction = null

        for (const part of functionCalls) {
          if (signal?.aborted) throw new Error('IRIS_ABORTED')
          const { name, args } = part.functionCall
          const handler = toolRegistry[name]

          if (!handler) {
            toolResults.push({ tool: name, error: `Unknown tool: ${name}` })
            continue
          }

          try {
            const toolResult = await handler(args || {}, context)
            toolResults.push({ tool: name, result: toolResult })

            if (toolResult?.action) {
              frontendAction = { action: toolResult.action, target: toolResult.target }
            }
          } catch (err) {
            toolResults.push({ tool: name, error: err.message })
          }
        }

        if (signal?.aborted) throw new Error('IRIS_ABORTED')

        // Send tool results back to Gemini for a natural language summary.
        // CRITICAL: wrap in its own try/catch. If this summary call fails
        // (429, network, etc.) we must NOT rethrow — that would fall through
        // to `continue` and re-enter the model loop, re-executing the same
        // tool calls (double file writes, double reminders, etc.).
        const toolSummary = toolResults.map(t => {
          if (t.error) return `Tool ${t.tool} failed: ${t.error}`
          return `Tool ${t.tool} result: ${JSON.stringify(t.result)}`
        }).join('\n')

        let finalText
        try {
          const followUp = await chat.sendMessage(
            `The user asked: "${message}"\n\nI executed these tools:\n${toolSummary}\n\nGive a brief, natural response about what was done. Do NOT use any tools in this response.`
          )
          finalText = followUp.response.text()
        } catch (summaryErr) {
          // Summary failed — build an honest local fallback rather than re-running tools
          console.warn(`[IrisEngine] ${modelName} follow-up summary failed (non-fatal): ${String(summaryErr.message).substring(0, 80)}`)
          finalText = toolResultSummary(toolResults)
        }

        // Persist and return — NEVER fall through to the next model after tools ran
        persistTurn(context, message, finalText, chatHistory)
        // Fire-and-forget memory extraction
        extractAndSaveMemories(context.sessionId, message, finalText)

        return {
          message:  finalText,
          source:   'iris',
          model:    modelName,
          action:   frontendAction,
          tools:    toolResults.map(t => t.tool),
          toolData: toolResults
        }
      }

      // No function calls — pure text response
      const textParts = (result.response.candidates?.[0]?.content?.parts || []).filter(p => p.text)
      const responseText = textParts.map(p => p.text).join('')

      // ── Persist turn via shared helper ────────────────────────────────
      persistTurn(context, message, responseText || 'I processed your request.', chatHistory)
      // Fire-and-forget memory extraction
      extractAndSaveMemories(context.sessionId, message, responseText || '')

      return {
        message: responseText || 'I processed your request.',
        source:  'iris',
        model:   modelName,
        action:  null,
        tools:   [],
        toolData: []
      }

    } catch (err) {
      if (err.message === 'IRIS_ABORTED') throw err   // propagate abort
      lastError = err
      const msg = err.message || ''
      if (msg.includes('429')) {
        console.warn(`[IrisEngine] ${modelName} → 429 rate limited, caching & trying next`)
        gemini429Cache.set(modelName, Date.now())
        continue
      }
      console.warn(`[IrisEngine] ${modelName} → Error: ${msg.substring(0, 100)}`)
    }
  }

  throw lastError || new Error('ALL_GEMINI_429')
}

// ── Legacy toolResultSummary helper (still used by Gemini engine) ──────────
/**
 * Build a human-readable summary of tool results for feeding back to the LLM.
 */
function toolResultSummary(toolResults) {
  return toolResults.map(t => {
    if (t.error) return `Tool ${t.tool} failed: ${t.error}`
    return `Tool ${t.tool} succeeded: ${JSON.stringify(t.result)}`
  }).join('\n')
}

// ── Shared tool protocol system prompt (OpenRouter + Sarvam) ─────────────────
// Contains the full tool list + [[TOOL_CALL]] format instructions.
const TOOL_PROTOCOL_PROMPT = `You are IRIS, the fully capable AI brain of SpiritOS — a web-based accessible operating system.
You are proactive and direct — when the user wants something done, DO IT using the tools, then confirm briefly.

CRITICAL: To perform ANY action (create/edit/delete/move files, open apps, set reminders, run commands, save notes/memory), you MUST emit the matching [[TOOL_CALL: ...]]. NEVER say something is done, created, opened, or saved unless you emitted the tool call for it in THIS reply. If you cannot do it, say so plainly. Do not describe actions as completed that you did not call a tool for.

Available tools (use the [[TOOL_CALL: ...]] format):
- open_app({"app_name": "app"}) — open FileExplorer, Calculator, Terminal, Notes, Browser, Settings, Translator, Reminders, Vault, Presentation, KnownBook, Emergency
- close_app({"app_name": "app"}) — close any app
- open_url({"url": "https://..."}) — open Browser to a URL (YouTube, Google, any site)
- create_reminder({"title": "...", "time_of_day": "HH:mm"}) — set medication/task reminder
- delete_reminder({"search_title": "..."}) — delete a reminder
- list_reminders({}) — list all reminders
- google_search({"query": "..."}) — search web for real-time info, news, weather, prices
- weather_report({"city": "..."}) — get current weather
- save_note({"title": "...", "content": "..."}) — save a note
- read_notes({}) — list all notes
- save_memory({"category": "identity|preferences|projects|relationships", "key": "...", "value": "..."}) — remember personal info
- recall_memory({"key": "..."}) — recall a memory
- create_folder({"folder_path": "..."}) — create a new directory/folder. ALWAYS use this for "create a folder" requests. Example: create_folder({"folder_path": "Downloads/Ayush"})
- write_file({"file_path": "...", "content": "..."}) — create/update a file (use create_folder for folders, not this)
- read_file({"file_path": "..."}) — read file contents
- read_directory({"directory_path": "..."}) — list folder contents
- manage_file({"action": "delete|move|copy|rename", "source_path": "..."}) — manage files
- run_terminal({"command": "..."}) — run safe shell commands
- remember_this({"text": "..."}) — explicitly store a fact the user asks to remember (e.g. "remember my son is Rahul")
- what_do_you_know_about_me({}) — list all stored long-term memories about the user

For compound requests like "open terminal and find my IP address", emit BOTH open_app({"app_name":"Terminal"}) and run_terminal({"command":"ipconfig"}). Do not stop after opening an app when the user also asks you to type, run, edit, create, or change something inside it.

TOOL_CALL FORMAT (must appear at end of your response, one per line):
[[TOOL_CALL: toolName, {"param": "value"}]]

Rules: Be direct. 1-2 sentences max. Do the action via tool call, then confirm. Never explain what you would do — just do it.`

/**
 * Shared finalizeToolReply helper — used by OpenRouter and Sarvam after
 * executeToolCalls. Gets an honest LLM summary OR falls back to summarizeOutcome.
 *
 * @param {Function} chatFn         — async (prompt, sysPrompt) => string
 * @param {string}   message        — original user message
 * @param {Object}   exec           — result from executeToolCalls
 * @param {string}   sysPrompt      — system prompt for the follow-up call
 * @param {Object}   context        — engine context
 * @param {Array}    history        — session history already loaded this turn
 * @param {string}   source         — 'openrouter' | 'sarvam'
 * @returns {Promise<Object>} engine result object
 */
async function finalizeToolReply(chatFn, message, exec, sysPrompt, context, history, source) {
  const toolSummary = exec.calls.map(c => {
    if (!c.ok) return `Tool ${c.tool} failed: ${c.error}`
    return `Tool ${c.tool} succeeded: ${JSON.stringify(c.result)}`
  }).join('\n')

  const followUpPrompt = `The user asked: "${message}"\n\nTool execution results:\n${toolSummary}\n\nGive a brief, honest response:\n- If all succeeded: confirm what was done\n- If some failed: say what worked and what didn't, suggest a fix\nDo NOT execute any more tools.`

  let finalText
  try {
    const rawReply = await chatFn(followUpPrompt, sysPrompt)
    finalText = rawReply || summarizeOutcome(exec.calls)
  } catch (_) {
    finalText = summarizeOutcome(exec.calls)
  }

  // Strip any stray markers from the follow-up
  const cleanFinal = finalText.replace(/\[\[TOOL_CALL:[\s\S]*?\]\]/g, '').trim() || summarizeOutcome(exec.calls)

  persistTurn(context, message, cleanFinal, history)
  return {
    message:   cleanFinal,
    source,
    action:    exec.primaryAction,
    anyFailed: exec.anyFailed,
    tools:     exec.calls.map(c => c.tool),
    toolData:  exec.calls
  }
}

// ── OpenRouter Fallback (free LLM models) ───────────────────────────────────

async function processWithOpenRouter(message, context) {
  // ── Load session history + user context (shared helpers) ────────────────
  const sessionHistory = await loadSessionHistory(context, 10)  // last 10 turns
  const userCtx        = await loadUserContext(context)

  // Build a context-rich prompt for the free model
  let prompt = message
  const [mem0Ctx, legacyMemCtx] = await Promise.all([
    loadMem0Context(context.sessionId, message),
    Promise.resolve(loadMemoryContext(context.sessionId))
  ])
  if (mem0Ctx)      prompt += mem0Ctx
  if (legacyMemCtx) prompt += legacyMemCtx
  if (userCtx)      prompt += userCtx

  if (context.osState) {
    const state = context.osState
    const parts = []
    if (state.openWindows?.length) parts.push(`Open apps: ${state.openWindows.join(', ')}`)
    if (state.userName) parts.push(`User: ${state.userName}`)
    if (parts.length) prompt = `[OS State: ${parts.join(' | ')}]\n\n${prompt}`
  }

  // Prepend compact conversation transcript so the model remembers the session
  let historyBlock = ''
  if (sessionHistory.length > 0) {
    const lines = sessionHistory.map(t =>
      `${t.role === 'assistant' ? 'IRIS' : 'User'}: ${t.content}`
    ).join('\n')
    historyBlock = `Recent conversation:\n${lines}\n\n`
  }

  const systemPrompt = TOOL_PROTOCOL_PROMPT + buildLanguageInstruction(context)

  const fullPrompt = historyBlock + prompt
  const reply = await chatWithOpenRouter(fullPrompt, systemPrompt)
  if (!reply) throw new Error('OPENROUTER_ALL_FAILED')

  // ── Execute ALL tool calls found in the reply (shared protocol layer) ───
  const exec = await executeToolCalls(reply, context)

  if (exec.needsConfirm) {
    // Tool requires explicit user confirmation before proceeding
    const confirmMsg = exec.needsConfirm.result?.message || 'This action requires your confirmation. Please confirm to proceed.'
    persistTurn(context, message, confirmMsg, sessionHistory)
    return {
      message:  confirmMsg,
      source:   'openrouter',
      action:   null,
      anyFailed: false,
      tools:    [],
      toolData: []
    }
  }

  if (exec.anyCalls) {
    return await finalizeToolReply(chatWithOpenRouter, message, exec, systemPrompt, context, sessionHistory, 'openrouter')
  }

  // No tool calls — return clean conversational reply
  persistTurn(context, message, exec.cleanReply, sessionHistory)
  return {
    message:   exec.cleanReply,
    source:    'openrouter',
    action:    null,
    anyFailed: false,
    tools:     [],
    toolData:  []
  }
}

// ── Groq Fallback ──────────────────────────────────────────────────────────

async function processWithGroq(message, context) {
  const sessionHistory = await loadSessionHistory(context, 10)
  const userCtx        = await loadUserContext(context)

  let prompt = message
  const [mem0Ctx, legacyMemCtx] = await Promise.all([
    loadMem0Context(context.sessionId, message),
    Promise.resolve(loadMemoryContext(context.sessionId))
  ])
  if (mem0Ctx)      prompt += mem0Ctx
  if (legacyMemCtx) prompt += legacyMemCtx
  if (userCtx)      prompt += userCtx

  if (context.osState) {
    const state = context.osState
    const parts = []
    if (state.openWindows?.length) parts.push(`Open apps: ${state.openWindows.join(', ')}`)
    if (state.userName) parts.push(`User: ${state.userName}`)
    if (parts.length) prompt = `[OS State: ${parts.join(' | ')}]\n\n${prompt}`
  }

  let historyBlock = ''
  if (sessionHistory.length > 0) {
    const lines = sessionHistory.map(t => `${t.role === 'assistant' ? 'IRIS' : 'User'}: ${t.content}`).join('\n')
    historyBlock = `Recent conversation:\n${lines}\n\n`
  }

  const systemPrompt = TOOL_PROTOCOL_PROMPT + buildLanguageInstruction(context)
  const reply = await chatWithGroq(historyBlock + prompt, systemPrompt)
  if (!reply) return null

  const exec = await executeToolCalls(reply, context)
  if (exec.anyCalls) {
    return await finalizeToolReply(chatWithGroq, message, exec, systemPrompt, context, sessionHistory, 'groq')
  }
  persistTurn(context, message, exec.cleanReply, sessionHistory)
  return { message: exec.cleanReply, source: 'groq', action: null, anyFailed: false, tools: [], toolData: [] }
}

// ── OpenAI Fallback ─────────────────────────────────────────────────────────

async function processWithOpenAI(message, context) {
  const sessionHistory = await loadSessionHistory(context, 10)
  const userCtx        = await loadUserContext(context)

  let prompt = message
  const [mem0Ctx, legacyMemCtx] = await Promise.all([
    loadMem0Context(context.sessionId, message),
    Promise.resolve(loadMemoryContext(context.sessionId))
  ])
  if (mem0Ctx)      prompt += mem0Ctx
  if (legacyMemCtx) prompt += legacyMemCtx
  if (userCtx)      prompt += userCtx

  if (context.osState) {
    const state = context.osState
    const parts = []
    if (state.openWindows?.length) parts.push(`Open apps: ${state.openWindows.join(', ')}`)
    if (state.userName) parts.push(`User: ${state.userName}`)
    if (parts.length) prompt = `[OS State: ${parts.join(' | ')}]\n\n${prompt}`
  }

  let historyBlock = ''
  if (sessionHistory.length > 0) {
    const lines = sessionHistory.map(t => `${t.role === 'assistant' ? 'IRIS' : 'User'}: ${t.content}`).join('\n')
    historyBlock = `Recent conversation:\n${lines}\n\n`
  }

  const systemPrompt = TOOL_PROTOCOL_PROMPT + buildLanguageInstruction(context)
  const reply = await chatWithOpenAI(historyBlock + prompt, systemPrompt)
  if (!reply) return null

  const exec = await executeToolCalls(reply, context)
  if (exec.anyCalls) {
    return await finalizeToolReply(chatWithOpenAI, message, exec, systemPrompt, context, sessionHistory, 'openai')
  }
  persistTurn(context, message, exec.cleanReply, sessionHistory)
  return { message: exec.cleanReply, source: 'openai', action: null, anyFailed: false, tools: [], toolData: [] }
}

// ── Sarvam Engine (Tier 1.5 — Indian-language LLM) ──────────────────────────

async function processWithSarvam(message, context) {
  if (!isSarvamEnabled()) throw new SarvamDisabledError()

  const sessionHistory = await loadSessionHistory(context, 10)
  const userCtx        = await loadUserContext(context)

  let prompt = message
  const [mem0Ctx, legacyMemCtx] = await Promise.all([
    loadMem0Context(context.sessionId, message),
    Promise.resolve(loadMemoryContext(context.sessionId))
  ])
  if (mem0Ctx)      prompt += mem0Ctx
  if (legacyMemCtx) prompt += legacyMemCtx
  if (userCtx)      prompt += userCtx

  if (context.osState) {
    const state = context.osState
    const parts = []
    if (state.openWindows?.length) parts.push(`Open apps: ${state.openWindows.join(', ')}`)
    if (state.userName) parts.push(`User: ${state.userName}`)
    if (parts.length) prompt = `[OS State: ${parts.join(' | ')}]\n\n${prompt}`
  }

  let historyBlock = ''
  if (sessionHistory.length > 0) {
    const lines = sessionHistory.map(t =>
      `${t.role === 'assistant' ? 'IRIS' : 'User'}: ${t.content}`
    ).join('\n')
    historyBlock = `Recent conversation:\n${lines}\n\n`
  }

  // Sarvam-M supports the [[TOOL_CALL]] protocol — use the shared prompt
  const systemPrompt = TOOL_PROTOCOL_PROMPT + buildLanguageInstruction(context)

  const messages = [{ role: 'user', content: historyBlock + prompt }]
  const result   = await sarvamChat(messages, { systemPrompt })
  if (!result.message) throw new Error('SARVAM_EMPTY_RESPONSE')

  // ── Execute ALL tool calls in the reply (shared protocol layer) ─────────
  const exec = await executeToolCalls(result.message, context)

  if (exec.needsConfirm) {
    const confirmMsg = exec.needsConfirm.result?.message || 'This action requires your confirmation. Please confirm to proceed.'
    persistTurn(context, message, confirmMsg, sessionHistory)
    return {
      message:   confirmMsg,
      source:    'sarvam',
      action:    null,
      anyFailed: false,
      tools:     [],
      toolData:  []
    }
  }

  if (exec.anyCalls) {
    // Sarvam: use the clean reply text from the model if it's meaningful,
    // otherwise fall back to summarizeOutcome (saves latency for Hindi users)
    const cleanModelText = exec.cleanReply
    if (!exec.anyFailed && cleanModelText) {
      persistTurn(context, message, cleanModelText, sessionHistory)
      return {
        message:   cleanModelText,
        source:    'sarvam',
        action:    exec.primaryAction,
        anyFailed: false,
        tools:     exec.calls.map(c => c.tool),
        toolData:  exec.calls
      }
    }
    // Some failed or no clean text — do honest follow-up via sarvamChat wrapper
    const sarvamChatFn = async (followUpPrompt, sysP) => {
      const r = await sarvamChat([{ role: 'user', content: followUpPrompt }], { systemPrompt: sysP })
      return r.message || ''
    }
    return await finalizeToolReply(sarvamChatFn, message, exec, systemPrompt, context, sessionHistory, 'sarvam')
  }

  // No tool calls — return conversational response as-is
  persistTurn(context, message, exec.cleanReply, sessionHistory)
  return {
    message:   exec.cleanReply,
    source:    'sarvam',
    action:    null,
    anyFailed: false,
    tools:     [],
    toolData:  []
  }
}

// ── Spirit Fallback ─────────────────────────────────────────────────────────

async function processWithSpirit(message, context, prisma) {
  const result = await spirit(message, context, prisma)
  // Spirit already persists this turn via saveSession() (bare-array format).
  // Do NOT call persistTurn here — it would race saveSession and wipe prior
  // history (persistTurn with no currentHistory defaults to [] and caps to 2 entries).

  // Spirit is the FRONTEND action engine — it does NOT execute server-side tools.
  // When Spirit returns an action (e.g. { action: 'openApp', target: 'Notes' }),
  // the client receives it and executes it on the frontend (WindowFrame, osStore).
  // This is correct: Spirit signals intent; the frontend acts.
  // Spirit messages should reflect this: "I'll open that for you" not "I created the file".
  // Spirit never claims a server-side file/DB operation succeeded — it routes frontend actions only.

  return {
    message:     result.message,
    source:      'spirit',
    action:      result.action || null,
    agent:       result.agent,
    duration_ms: result.duration_ms
  }
}

// ── Triple-Engine Processor ─────────────────────────────────────────────────

/**
 * Parse AI_ENGINE_ORDER env var into an array of engine names.
 * Defaults to ['gemini', 'sarvam', 'openrouter', 'spirit'].
 */
function getEngineOrder() {
  const raw = _process.env.AI_ENGINE_ORDER || 'gemini,openai,groq,sarvam,openrouter,spirit'
  return raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

/**
 * Process a user message through the configurable engine cascade.
 *
 * @param {string}  message  – User's natural language input
 * @param {Object}  context  – { osState, sessionId }
 * @param {Object}  prisma   – Prisma client (for Spirit fallback)
 * @returns {Object} – { message, source, action, ... }
 */
async function process(message, context, prisma) {
  // If Spirit-only mode is configured, skip everything else
  if (getPrimaryEngine() === 'spirit') {
    return processWithSpirit(message, context, prisma)
  }

  const localCommand = localActionCandidate(message, context)
  if (localCommand) {
    const r = await processWithSpirit(message, context, prisma)
    if (r.action) {
      r.fastPath = 'local-indic-command'
      return r
    }
  }

  const engineOrder = getEngineOrder()
  const geminiEnabled = _process.env.GEMINI_ENABLED !== 'false'

  // Detect whether the user locale is Indic — used to prefer Sarvam early
  const locale = currentVoiceLocale(context)
  const isIndicLocale = locale.startsWith('hi') || locale.startsWith('mr')
    || locale.startsWith('bn') || locale.startsWith('ta') || locale.startsWith('te')
    || locale.startsWith('gu') || locale.startsWith('kn') || locale.startsWith('ml')
    || locale.startsWith('pa') || locale.startsWith('ur')
  const preferSarvamForIndic = _process.env.AI_PREFER_SARVAM_FOR_INDIC !== 'false'
  const preferSarvam = isSarvamEnabled() && isIndicLocale && preferSarvamForIndic

  // If Indic locale and preferSarvam is on, move 'sarvam' to front of the order
  let orderedEngines = [...engineOrder]
  if (preferSarvam) {
    orderedEngines = ['sarvam', ...orderedEngines.filter(e => e !== 'sarvam')]
  }

  let lastErr = null

  for (const engine of orderedEngines) {
    try {
      if (engine === 'gemini' || engine === 'iris') {
        if (!geminiEnabled) { console.log('[IrisEngine] Gemini disabled, skipping'); continue }
        const abortCtrl = new AbortController()
        const irisPromise = processWithIris(message, context, abortCtrl.signal)
        let timeoutHandle = null
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => {
            abortCtrl.abort()
            reject(new Error('IRIS_TIMEOUT'))
          }, getFallbackTimeout())
        })
        try {
          return await Promise.race([irisPromise, timeoutPromise])
        } finally {
          // Cancel the dangling timer once the race settles so a successful
          // IRIS response doesn't leave a timer that fires abort() later.
          if (timeoutHandle) clearTimeout(timeoutHandle)
        }
      }

      if (engine === 'sarvam') {
        if (!isSarvamEnabled()) { console.log('[IrisEngine] Sarvam disabled, skipping'); continue }
        console.log(`[IrisEngine] Trying Sarvam (${preferSarvam ? 'Indic locale' : 'order position'})...`)
        const r = await processWithSarvam(message, context)
        if (lastErr) r.fallbackReason = lastErr.message
        return r
      }

      if (engine === 'openai') {
        if (!isOpenAIAvailable()) { console.log('[IrisEngine] OpenAI unavailable (no key), skipping'); continue }
        console.log('[IrisEngine] Trying OpenAI (gpt-4o-mini)...')
        const r = await processWithOpenAI(message, context)
        if (r) {
          if (lastErr) r.fallbackReason = lastErr.message
          return r
        }
        continue
      }

      if (engine === 'openrouter') {
        if (!isOpenRouterAvailable()) { console.log('[IrisEngine] OpenRouter unavailable, skipping'); continue }
        console.log('[IrisEngine] Trying OpenRouter...')
        const r = await processWithOpenRouter(message, context)
        if (lastErr) r.fallbackReason = lastErr.message
        return r
      }

      if (engine === 'groq') {
        if (!isGroqAvailable()) { console.log('[IrisEngine] Groq unavailable (no key), skipping'); continue }
        console.log('[IrisEngine] Trying Groq (llama-3.3-70b)...')
        const r = await processWithGroq(message, context)
        if (r) {
          if (lastErr) r.fallbackReason = lastErr.message
          return r
        }
        continue
      }

      if (engine === 'spirit') {
        console.log('[IrisEngine] Falling back to Spirit...')
        const r = await processWithSpirit(message, context, prisma)
        if (lastErr) r.fallbackReason = lastErr.message
        return r
      }

    } catch (err) {
      lastErr = err
      const reason = err.message === 'NO_API_KEY'   ? 'no_api_key'
                   : err.message === 'IRIS_TIMEOUT'  ? 'timeout'
                   : 'error'
      console.warn(`[IrisEngine] ${engine} failed (${reason}):`, err.message)
    }
  }

  // All engines failed
  console.error('[IrisEngine] All engines exhausted')
  return {
    message: 'I had trouble understanding that. Please try again.',
    source:  'error',
    action:  null,
    error:   lastErr?.message || 'all_engines_failed'
  }
}

// ── Engine status helper (for frontend indicator) ───────────────────────────

function getEngineStatus() {
  const hasGeminiKey = !!_process.env.GEMINI_API_KEY
  const geminiEnabled = _process.env.GEMINI_ENABLED !== 'false'
  const primary = getPrimaryEngine()
  const orStatus = getOpenRouterStatus()
  const engineOrder = getEngineOrder()
  return {
    primary,
    engineOrder,
    irisAvailable:       hasGeminiKey && geminiEnabled && primary !== 'spirit',
    geminiEnabled,
    openRouterAvailable: orStatus.available,
    openRouterModels:    orStatus.activeModels,
    sarvamAvailable:     isSarvamEnabled(),
    spiritAvailable:     true,
    fallbackTimeoutMs:   getFallbackTimeout()
  }
}

module.exports = { process, getEngineStatus, processWithIris, processWithOpenRouter, processWithSarvam, processWithSpirit, loadSessionHistory, persistTurn, loadUserContext }

# Spirit OS System Documentation

This document describes the current Spirit OS implementation: runtime architecture, AI engines, voice workflow, app workflow, server routes, data model, and release operations.

## 1. High-Level Architecture

```text
User input
  -> Client input layer
     -> Zustand stores / app event bus
        -> Desktop window manager and app components
        -> Server API calls when needed
           -> Express route
              -> AI engine, filesystem, terminal, Prisma, OCR, voice, or automation service
```

The product behaves like a desktop OS inside the browser. The client owns the desktop shell, windows, apps, accessibility settings, camera-based inputs, and local action execution. The server owns privileged operations: filesystem, terminal, persistence, AI providers, document parsing, OCR, voice services, and vault data.

## 2. Packages

### Client

Path: `client/`

Stack:

- React 18
- Vite 8
- Zustand + Immer
- Framer Motion
- Tailwind CSS
- lucide-react
- react-rnd
- axios
- MediaPipe Hands and Tasks Vision
- TensorFlow.js
- face-api.js

Important files:

- `src/App.jsx` - root shell composition.
- `src/desktop/WindowFrame.jsx` - app registry and lazy loading.
- `src/store/windowStore.js` - window lifecycle, focus, minimize, maximize, z-order.
- `src/store/osStore.js` - accessibility, theme, language, voice, notifications, persisted preferences.
- `src/hooks/useGeminiVoice.js` - live assistant voice loop.
- `src/input/VoiceController.jsx` - classic command voice controller.
- `src/input/GestureController.jsx` - hand gesture control.
- `src/input/SignLanguageController.jsx` - sign-language input.
- `src/input/EyeTracker.jsx` - gaze tracking.
- `src/lib/indianVoiceNormalize.js` - Indic-language command normalization.
- `src/lib/speechBus.js` - single spoken-output coordinator.

### Server

Path: `server/`

Stack:

- Node.js CommonJS
- Express
- Prisma 5
- SQLite
- express-session
- ws
- zod
- multer
- Gemini SDK
- OpenRouter via fetch
- Sarvam API
- pdf-parse, mammoth, tesseract.js, cheerio
- compromise, chrono-node, fuse.js

Important files:

- `index.js` - Express server, route mounting, WebSocket setup.
- `routes/agent.js` - assistant chat endpoint.
- `lib/irisEngine.js` - AI engine cascade.
- `lib/irisTools.js` - tool registry and Gemini function declarations.
- `lib/toolProtocol.js` - engine-agnostic `[[TOOL_CALL]]` executor.
- `lib/spirit.js` - offline deterministic assistant.
- `lib/indianVoiceNormalize.js` - server-side Indic command normalization.
- `routes/fs.js` - filesystem API.
- `routes/terminal.js` - terminal execution API.
- `routes/voice.js` - Sarvam TTS/STT/translation bridge.
- `prisma/schema.prisma` - database schema.

## 3. Desktop Shell

The desktop is a real app surface, not a landing page.

Core shell pieces:

- `Desktop.jsx` renders wallpaper, desktop icons, assistant controls, and shell overlays.
- `Taskbar.jsx` shows pinned/running apps.
- `WindowFrame.jsx` wraps each app in a draggable/resizable window and lazy-loads app modules.
- `windowStore.js` tracks each window as `{ id, app, title, position, size, focused, minimized, maximized, props }`.
- `appConfig.js` defines app metadata, default sizes, taskbar behavior, gesture actions, and voice defaults.

Registered apps:

- File Explorer
- Terminal
- Calculator
- Notes
- Browser
- Settings
- Translator
- Mail
- KnownBook
- Presentation
- Reminders
- Emergency
- Vault
- PdfViewer
- ImageViewer

## 4. Input Workflows

### Voice Assistant Workflow

```text
Microphone
  -> Web Speech API SpeechRecognition
  -> useGeminiVoice.processUtterance()
  -> normalizeIndianVoiceCommand()
  -> POST /api/agent/chat
  -> irisEngine.process()
  -> response message + optional action
  -> client executes local action
  -> useSarvamTTS / Web Speech speaks reply
```

Direct client-side voice bridges exist for high-confidence app edits:

- Terminal commands dispatch `spiritos:terminal-run`.
- Notes edits dispatch `spiritos:notes-edit`.
- App open/close/theme/reminder/SOS actions execute through `executeAgentAction()`.

Settings language is read from `osStore.voiceLocale`. Supported command locales are centralized in `client/src/config/voiceLanguages.js` and mirrored by client/server command normalizers.

### Indic Language Workflow

Indic command text is normalized before AI classification. Supported locales:

- English US / India
- Hindi
- Marathi
- Bengali
- Tamil
- Telugu
- Gujarati
- Kannada
- Malayalam
- Punjabi

Examples:

- Gujarati `કેમ છો` -> `hello how are you`
- Marathi `टर्मिनल उघडून IP दाखव` -> `open terminal and find my ip address`
- Gujarati `ટર્મિનલ ખોલીને બેટરી બતાવો` -> `battery status`

The client also localizes direct action replies so app-open/terminal/notes responses follow the selected Settings language.

### Gesture Workflow

```text
Camera
  -> sharedCamera
  -> GestureController
  -> loadMediaPipeHands()
  -> MediaPipe Hands or Tasks Vision
  -> gesture classifier
  -> window/app action
```

`loadMediaPipeHands.js` loads MediaPipe Hands from local public assets and falls back to script injection if module import is unavailable.

### Sign-Language Workflow

```text
Camera
  -> SignLanguageController
  -> hand landmarks
  -> TF.js/custom classifier or fallback rules
  -> sign action / Translator app
```

The "Three" translator gesture accepts the app's current three-finger and ASL-style variants.

### Eye Tracking Workflow

```text
Camera
  -> EyeTracker
  -> face/iris landmarks
  -> calibration / smoothing
  -> cursor movement / dwell actions
```

The feature is controlled from Settings and `osStore`.

## 5. AI Engines

All assistant requests enter through:

```text
POST /api/agent/chat
```

The route builds a session, loads persisted conversation history, and calls `irisEngine.process(message, context, prisma)`.

### Engine Order

Default:

```text
gemini,sarvam,openrouter,spirit
```

Configured by `AI_ENGINE_ORDER`.

### Gemini / IRIS

File: `server/lib/irisEngine.js`

Gemini is the primary tool-calling engine when `GEMINI_API_KEY` is set and `GEMINI_ENABLED` is not `false`.

Workflow:

```text
message + context + system prompt
  -> Gemini model
  -> Gemini function calls
  -> irisTools handlers
  -> tool results
  -> summary prompt without more tools
  -> final message + tool data + optional frontend action
```

Gemini has direct function declarations from `irisTools.js`.

### Sarvam

Sarvam is used in two ways:

- TTS/STT/translation through `routes/voice.js`.
- Optional LLM engine through `processWithSarvam()`.

For Indic locales, Sarvam can be preferred early when:

```text
SARVAM_ENABLED=true
AI_PREFER_SARVAM_FOR_INDIC=true
```

Sarvam LLM uses the shared text tool protocol:

```text
[[TOOL_CALL: toolName, {"arg":"value"}]]
```

### OpenRouter

OpenRouter is an LLM fallback for free/low-cost models when `OPENROUTER_API_KEY` is configured.

Like Sarvam, it uses the shared `[[TOOL_CALL]]` protocol and `toolProtocol.js` executes every tool call in order.

### Spirit Offline Engine

File: `server/lib/spirit.js`

Spirit is always available and requires no network or API key. It is deterministic NLP over normalized commands.

It handles:

- greetings
- app open/close
- theme changes
- reminders
- SOS
- basic accessibility toggles
- offline fallback replies
- localized Indic fallback/greeting responses

Spirit returns frontend actions but does not execute server-side tools directly.

## 6. Tool System

Primary tool registry: `server/lib/irisTools.js`

Tool categories:

- Filesystem: read directory, create folder, read file, write file, manage file.
- Apps: open app, close app, open URL.
- Terminal: run terminal command through guarded execution.
- Notes/memory: save/read notes, save/recall memory.
- Search/weather: Tavily search and weather helper.
- Reminders/SOS/automation/vault-related helpers where available.

Safety:

- Destructive file deletion requires explicit confirmation.
- Terminal commands are filtered by an allowlist in `server/routes/terminal.js` and supporting safety code.
- Express sessions require `SESSION_SECRET`.
- Database and env files are ignored by Git.

## 7. Server Routes

Mounted route groups:

- `/api/agent` - AI assistant chat and engine status.
- `/api/auth` - register, login, logout, current user.
- `/api/fs` - file tree/list/read/write/create/move/delete/trash/search/view/stats.
- `/api/terminal` - guarded command execution and allowed command list.
- `/api/profile` - accessibility/user profiles.
- `/api/known-book` - known-person records for caregiver/Alzheimer support.
- `/api/upload` - authenticated photo upload.
- `/api/log` - client log ingestion.
- `/api/presentations` - deck CRUD and seed data.
- `/api/reminders` - reminder CRUD and manual fire.
- `/api/emergency` - SOS contacts.
- `/api/memory` - local memory store.
- `/api/search` - indexing, query, parse, spotlight search.
- `/api/automation` - workflow rules and schedules.
- `/api/vault` - PIN/unlock/entry management.
- `/api/voice` - Sarvam TTS/STT/translation/status.
- `/uploads` - static uploaded files.

## 8. Data Model

Prisma schema: `server/prisma/schema.prisma`

SQLite is the default development database. The database filename still uses the legacy `savitaos.db` name.

Models:

- `UserProfile` - accessibility profile and language settings.
- `KnownPerson` - caregiver-known faces and notes.
- `AgentSession` - persisted assistant conversation history.
- `FileActivity` - filesystem activity log.
- `WorkflowRule` - automation rules.
- `Presentation` - saved/builtin slide decks.
- `Reminder` - medication/task reminders.
- `EmergencyContact` - SOS contacts.

## 9. Filesystem Access

`FS_ROOT` controls the root exposed to File Explorer.

- Empty `FS_ROOT` defaults to the user's home directory.
- `./demo-filesystem` can be used for safe demo data.
- Windows drive paths are supported by the server route layer.
- File read/write actions are guarded by scope permissions.

## 10. Terminal Access

Terminal UI: `client/src/apps/Terminal/index.jsx`

Server API: `server/routes/terminal.js`

The terminal supports both standard commands and natural-language shortcuts, including:

- IP/network info
- battery status
- Wi-Fi status
- disk space
- system info
- running apps/processes

Unknown natural-language terminal requests can ask the AI tool layer for a best matching tool, but raw command execution is still guarded by the backend allowlist.

## 11. Voice And Speech Output

`useSarvamTTS.js` chooses spoken output:

```text
Sarvam TTS when online and enabled
  -> audio playback
otherwise
  -> Web Speech fallback
```

`speechBus.js` prevents duplicate speech and stops previous utterances before speaking the next reply. The active language is passed through from Settings for assistant replies.

## 12. Configuration

Required:

- `SESSION_SECRET`

Recommended development values:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=file:./savitaos.db
FS_ROOT=
AI_ENGINE_ORDER=gemini,sarvam,openrouter,spirit
AI_FALLBACK_TIMEOUT_MS=10000
```

Optional AI/voice keys:

- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `SARVAM_API_KEY`
- `SARVAM_ENABLED`
- `TAVILY_API_KEY`
- `GROQ_API_KEY`

Without provider keys, Spirit OS still runs with the offline Spirit engine.

## 13. Development Commands

Server:

```powershell
cd server
npm install
npm run db:generate
npm run dev
npm test
```

Client:

```powershell
cd client
npm install
npm run dev
npm test
npm run build
```

## 14. Push Readiness

Before pushing:

1. Ensure `server/.env` is not committed.
2. Ensure `server/prisma/*.db` is not committed.
3. Run server tests.
4. Run client tests.
5. Run client production build.
6. Confirm app opens at `http://localhost:5173`.
7. Confirm backend health at `http://localhost:3001/api/health`.
8. Confirm critical flows: open app, voice command, notes AI, terminal natural-language command, File Explorer read/write, reminders, language switching.

See `docs/RELEASE_CHECKLIST.md` for the shorter checklist.


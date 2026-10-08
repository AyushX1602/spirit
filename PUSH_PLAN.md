# Spirit OS: 30-Stage Architecture & Push Roadmap

Target Repository: [https://github.com/AyushX1602/spirit](https://github.com/AyushX1602/spirit)  
Enforced Delay: **>= 15 minutes** between consecutive pushes  
Commit Timestamps: Active timestamps starting **October 8, 2026** (all older dates excluded)  
Feature Focus: **Voice Assistant, Multilingual Agent, Hand Gestures, iGesture Eye Tracking, Core Apps (Calc, Terminal, Notes), PostgreSQL persistence.**  
*(Skipped niche/time-intensive bloat: Sign language dataset collector, Face descriptor models, Alzheimer progression states, Slide presentation builder, Emergency SOS dispatcher)*

---

## 🚀 Batch 1: Stages 1–10 (Initial 10 Pushes — Pausing after Push 10)

| Push # | Target Time | Status | Commit Message | Files / Scope |
|:---:|:---:|:---:|:---|:---|
| **1** | Oct 8, 14:36 | ✅ **Pushed** | `chore: initialize repository structure and licensing` | `.gitignore`, `LICENSE`, `start-demo.cmd` |
| **2** | Oct 8, 14:52 | ⏳ Queued | `docs: add Spirit OS architecture documentation and core specifications` | `README.md`, `docs/` |
| **3** | Oct 8, 15:07 | ⏳ Queued | `feat(server): setup Node.js Express server and environment configuration` | `server/package.json`, `server/.env.example` |
| **4** | Oct 8, 15:23 | ⏳ Queued | `feat(server): configure PostgreSQL and Prisma database persistence` | `server/prisma/`, `server/lib/prisma.js` |
| **5** | Oct 8, 15:38 | ⏳ Queued | `feat(server): implement Express core runtime, session auth and WebSocket gateway` | `server/index.js`, `server/middleware/`, `server/ws.js` |
| **6** | Oct 8, 15:54 | ⏳ Queued | `feat(client): bootstrap React Vite client with Tailwind CSS and desktop themes` | `client/package.json`, `vite.config.js`, `tailwind.config.js`, `index.css`, `App.jsx` |
| **7** | Oct 8, 16:09 | ⏳ Queued | `feat(client): implement OS state engine and window management with Zustand` | `client/src/store/`, `appConfig.js`, `terminalLogger.js` |
| **8** | Oct 8, 16:25 | ⏳ Queued | `feat(client): build draggable window subsystem and desktop canvas layout` | `WindowFrame.jsx`, `Desktop.jsx`, system & shortcut hooks |
| **9** | Oct 8, 16:40 | ⏳ Queued | `feat(client): implement animated taskbar, application launcher, and quick settings` | `Taskbar.jsx`, `AppLauncher.jsx`, `QuickSettings.jsx` |
| **10** | Oct 8, 16:56 | ⏳ Queued | `feat(client): add interactive desktop icons, context menu, and accessibility feature bar` | `DesktopIcon.jsx`, `ContextMenu.jsx`, `FeatureBar.jsx` |

> ⏸️ **Execution halts after Push 10 as requested.**

---

## 🎙️ Batch 2: Stages 11–30 (Core Apps, Input Modalities & Voice Engine)

- **Push 11:** `feat(apps): implement scientific Calculator app with math evaluation` (`client/src/apps/Calculator/`)
- **Push 12:** `feat(apps): implement rich Notes app with persistent storage` (`client/src/apps/Notes/`)
- **Push 13:** `feat(apps): implement virtual Terminal with command execution and security sandbox` (`client/src/apps/Terminal/`, `server/routes/terminal.js`, `commandSafety.js`)
- **Push 14:** `feat(apps): implement File Explorer and sandboxed virtual filesystem REST API` (`client/src/apps/FileExplorer/`, `server/routes/fs.js`, `demo-filesystem/`)
- **Push 15:** `feat(apps): add Settings app for theme, audio, and OS preferences` (`client/src/apps/Settings/`, `useAccessibility.js`, `profile.js`)
- **Push 16:** `feat(input): add shared webcam streaming service and MediaPipe assets pipeline` (`copy-mediapipe.mjs`, `sharedCamera.js`, `loadMediaPipeHands.js`)
- **Push 17:** `feat(input): implement spatial hand gesture controller (open/close apps, pinch click)` (`GestureController.jsx`, `gestureConfig.js`)
- **Push 18:** `feat(input): implement iGesture ocular tracking using iris center landmarks` (`EyeTracker.jsx`)
- **Push 19:** `feat(voice): implement speech coordination bus and audio output manager` (`speechBus.js`, audio priority handlers)
- **Push 20:** `feat(voice): implement Web Speech recognition and voice command parser` (`VoiceController.jsx`, continuous listening)
- **Push 21:** `feat(voice): add structured voice intents for OS navigation and app control` (`voiceIntents.js`, command dispatcher)
- **Push 22:** `feat(voice): implement multilingual speech normalization for regional languages` (`indianVoiceNormalize.js`, voice error correction)
- **Push 23:** `feat(voice): integrate Gemini Live real-time bidirectional voice assistant loop` (`useGeminiVoice.js`, `geminiVoice.js`)
- **Push 24:** `feat(voice): integrate Sarvam AI for native Indian voice STT and TTS` (`sarvam.js`, `gnani.js`, `routes/voice.js`)
- **Push 25:** `feat(agent): implement offline deterministic Spirit NLP engine for local fallback` (`spirit.js`, `nlp.js`)
- **Push 26:** `feat(agent): implement IRIS multi-tier AI engine cascade with dynamic model routing` (`irisEngine.js`, `groqClient.js`, `openAIClient.js`, `agent.js`)
- **Push 27:** `feat(agent): implement OS tool calling protocol and system actions registry` (`irisTools.js`, `toolProtocol.js`, `desktopAutomation.js`)
- **Push 28:** `feat(agent): add business and commercial domain reasoning capabilities` (`irisEngine.js`, business calculations, executive analysis)
- **Push 29:** `feat(agent): support universal multilingual understanding across arbitrary languages` (`irisEngine.js` universal multi-language support)
- **Push 30:** `feat(system): add boot screen, system sounds, and complete integration` (`BootScreen.jsx`, `SpiritOSApp.jsx`, landing & audio assets)

# Spirit OS

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/AyushX1602/spirit)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/AyushX1602/spirit)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/AyushX1602/spirit/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Node.js%20%7C%20Postgres-purple.svg)](https://github.com/AyushX1602/spirit)
[![Live Demo](https://img.shields.io/badge/demo-live%20preview-success.svg)](https://spirit-lyart.vercel.app/app)

> **Spirit OS** is a next-generation, agentic web operating system designed for natural human-computer interaction. It transforms any web browser into a complete desktop computing environment powered by **spatial hand gestures**, **ocular gaze tracking (iGesture)**, and an **autonomous multilingual AI voice agent**.
> 
> 🌐 **Live Interactive Preview:** [https://spirit-lyart.vercel.app/app](https://spirit-lyart.vercel.app/app) *(Experience hands-free gestures, eye-tracking, and multilingual voice control live in the browser)*

---

## 🎯 For Whom It Is Built

Spirit OS is engineered from the ground up for:

- **Motor-Impaired & Accessibility Users:** Individuals who cannot use a standard mouse or keyboard can navigate and control the entire operating system hands-free using eye gaze movements, blinks, and subtle hand gestures.
- **Hands-Free & Spatial Computing Enthusiasts:** Users in environments where hands are occupied or sterile (laboratories, kitchens, workshops, medical bays, kiosks) who need seamless spatial control over desktop windows and applications.
- **Multilingual & Native Language Speakers:** Users who prefer speaking in their local native language (including Hindi, Marathi, Tamil, Bengali, Telugu, Gujarati, Spanish, French, Mandarin, Arabic, etc.) rather than English. Spirit OS understands commands in any language, dialect, or mixed vernacular (such as Hinglish).
- **Professionals & Business Operators:** Power users who want an autonomous AI agent capable of analyzing business matters (financial margins, revenue/cost calculations, profit projections, ROI, executive briefs) and executing real OS actions like creating files, running scripts, and opening applications.
- **Zero-Install Cloud Desktop Users:** Anyone needing a responsive, secure desktop operating system that boots instantly in the browser without OS installation or elevated native drivers.

---

## ⚡ What It Does

### 1. Spatial Hand Gesture Control
- **Computer Vision Pipeline:** Processes webcam video frames through `@mediapipe/hands` to detect 21 three-dimensional hand landmarks in real time.
- **Intuitive Gesture Vocabulary:**
  - 👆 **Point (Index Extended):** Drives a floating holographic cursor across the viewport.
  - 👌 **Pinch (Thumb + Index Touch):** Triggers a primary mouse click on the targeted desktop element.
  - 🖐 **Open Palm:** Quick-opens Notes or summons the App Launcher.
  - 👎 **Thumb Down:** Instantly closes the currently focused window.
  - ✌️ **Peace Sign:** Opens the Calculator app.
  - ✊ **Fist:** Executes a secondary / right-click action.
  - 👋 **Horizontal Swipe:** Cycles focus between active windows or navigates desktop workspaces.
- **Distance Invariance:** Calculates gestures relative to the user's palm scale (Index MCP to Pinky MCP), guaranteeing reliable recognition regardless of distance from the camera.

### 2. iGesture: Ocular Gaze & Eye Tracking
- **Iris Landmark Tracking:** Tracks pupil centers and iris boundaries (landmarks 468 & 473) using MediaPipe FaceLandmarker.
- **Cursor Redirection:** Translates eye movements in any direction directly into virtual cursor screen coordinates $(X, Y)$.
- **Jitter Filtering:** Implements Exponential Moving Average (EMA) and deadzone dampening to eliminate micro-saccadic eye tremors and maintain cursor stability while reading.
- **Dwell Activation & Blink Trigger:**
  - **Dwell Click:** Pausing gaze over a button displays a smooth circular progress ring and fires a click upon 750ms dwell.
  - **Blink Trigger:** Calculates the Eye Aspect Ratio (EAR) to detect intentional double-blinks for contextual actions.
- **Interactive 9-Point Calibration:** A visual calibration target maps eye movement bounds to screen resolution and saves calibration weights per user.

### 3. Autonomous Multilingual Voice Agent ("Spirit Copilot")
- **Continuous Voice Processing:** High-accuracy audio ingestion via Web Speech API and low-latency bidirectional voice streams.
- **Universal Language Comprehension:** Native handling of English, regional vernacular languages, and any world language. The agent auto-detects language and syntax errors, normalizes accents, and responds in the user's spoken tongue.
- **Business Domain Intelligence:** Deep commercial comprehension—analyzes balance sheets, calculates gross profit margins, break-even points, compound interest, ROI, pricing strategies, and formats meeting minutes.
- **OS Action Execution (Tool Calling):** The agent does not merely answer questions—it acts on the OS:
  - *Opens and closes applications* (`open_app`, `close_app`).
  - *Creates and retrieves notes* (`save_note`, `read_notes`).
  - *Evaluates complex math expressions* (`calculate`, `business_analysis`).
  - *Executes terminal and shell commands* (`run_terminal`).
  - *Navigates web URLs and live search* (`open_url`, `google_search`, `weather_report`).
- **Resilient AI Cascade:** Primary tool-calling through Google Gemini, ultra-fast inference via Groq, native Indic speech synthesis via Sarvam AI, and complete offline fallback via the built-in deterministic Spirit NLP engine.

### 4. Built-in Core Native Applications
- **Calculator:** Standard and scientific calculation modes with memory, history drawer, and direct integration with voice commands.
- **Terminal:** Web-based terminal with command history, security verification sandbox, virtual filesystem navigation, and safe command execution.
- **Notes:** Rich Markdown editor with real-time word counting, tag filtering, AI writing assistant, and persistent storage.
- **File Explorer:** Multi-pane virtual filesystem manager with folder tree navigation, search, and file upload capabilities.
- **Settings:** Accessibility profiles, theme switching (dark/glass/light), camera calibration wizards, gesture sensitivity sliders, and audio voice selection.

### 5. Desktop Environment & Shell Runtime
- **Window Management Subsystem:** Multi-window layering, drag-and-drop repositioning, corner resizing, maximize, minimize, snap, and z-index focus arbitration via `react-rnd`.
- **Top Taskbar:** System telemetry (clock, network status, battery level, audio mute) and rapid feature toggles.
- **MacOS-Style Dock:** Bottom application launcher with active state indicator dots and smooth hover magnification.
- **Global Search:** Spotlight-style universal launcher (`Ctrl + K` or `Cmd + K`) to search applications, files, and commands.

---

## 🛠️ How It Is Built

Spirit OS is built with a modern, decoupled client-server architecture:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (Browser)                                  |
|  React 18/19 + Vite + Tailwind CSS + Framer Motion + Zustand State Engine          |
|                                                                                   |
|  +--------------------+   +---------------------+   +--------------------------+  |
|  |  MediaPipe Hands   |   |   iGesture Tracker  |   |    Web Speech Engine     |  |
|  | (21 3D Landmarks)  |   | (Iris MediaPipe LM) |   | (Gemini Live + Sarvam)   |  |
|  +--------------------+   +---------------------+   +--------------------------+  |
|            |                         |                           |                |
|            +-------------------------+---------------------------+                |
|                                      |                                            |
|                    [ Multimodal Input Arbitration Bus ]                           |
|                                      |                                            |
|  +-----------------------------------------------------------------------------+  |
|  |             Spirit Shell (WindowFrame, Desktop Canvas, Dock, Taskbar)       |  |
|  +-----------------------------------------------------------------------------+  |
|  |              Core Applications (Calculator, Terminal, Notes, etc.)          |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                       |
                   HTTP REST API (JSON) + WebSockets (/ws)
                                       |
+-----------------------------------------------------------------------------------+
|                                 SERVER (Node.js)                                  |
|  Express.js + WebSocket Gateway + Security Middleware + AI Fallback Cascade       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |    IRIS AI Orchestrator: Gemini 2.0 -> Groq -> Sarvam -> Spirit Engine     |  |
|  +-----------------------------------------------------------------------------+  |
|  |    OS Tool Protocol: App Control, Terminal Runner, File System, Business    |  |
|  +-----------------------------------------------------------------------------+  |
|                                      |                                            |
|                               Prisma 5.x ORM                                      |
|                                      |                                            |
|                            PostgreSQL Database                                    |
|              (User Profiles, Sessions, Notes, Settings, History)                 |
+-----------------------------------------------------------------------------------+
```

### Technology Stack Details

| Layer | Component | Technologies |
| :--- | :--- | :--- |
| **Frontend UI** | Framework & Bundler | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Frontend State** | Window & OS Store | Zustand + Immer (zero-render cascade state management) |
| **Window Subsystem** | Drag, Resize, Snap | `react-rnd` with custom z-index elevation |
| **Computer Vision** | Hand & Gaze Tracking | `@mediapipe/hands`, `@mediapipe/tasks-vision`, Web Workers |
| **Audio & Speech** | Voice Input / Output | Web Speech API, Web Audio API, Sarvam TTS/STT, Gemini Live |
| **Backend API** | Runtime & Server | Node.js (>= 20), Express, WebSockets (`ws`) |
| **Database** | Persistence Layer | **PostgreSQL** with Prisma ORM (SQLite fallback supported) |
| **AI Agent Cascade** | Multilingual Reasoning | Google Gemini 2.0, Groq SDK, Sarvam AI, Local NLP Engine |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 10 or higher
- **PostgreSQL**: Local instance, cloud connection string, or Docker

### 1. Clone the Repository
```bash
git clone https://github.com/AyushX1602/spirit.git
cd spirit
```

### 2. Database Setup (PostgreSQL)

You can run PostgreSQL locally or start it instantly via Docker Compose:

```bash
# Start PostgreSQL container on port 5432
docker compose up -d
```

### 3. Server Configuration & Installation
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env

# Switch Prisma to PostgreSQL and sync database schema
npm run db:postgres
npm run db:push
```

### 4. Client Installation & MediaPipe Assets
```bash
cd ../client
npm install
```

### 5. Launch Spirit OS
Run both servers in separate terminal windows:

```bash
# Terminal 1: Backend Server (http://localhost:3001)
cd server
npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

Open `http://localhost:5173` in your browser. Allow camera and microphone permissions when prompted to enable spatial hand gestures, eye tracking, and voice commands.

---

## 🔒 Security & Privacy

- **On-Device Vision AI:** MediaPipe hand tracking and eye gaze tracking run 100% locally in your browser. No webcam video or image frames are ever transmitted to any external server.
- **Audio Privacy:** Microphone audio is processed only when the voice feature is active, with visible top-bar status indicators.
- **Safe Command Sandbox:** Terminal commands invoked by user requests or AI agent tool calls pass through safety filters that block harmful commands and directory traversal.

import { Link } from "react-router-dom";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { ChapterSidebar } from "../components/how-to/chapter-sidebar";
import {
  BodyPara,
  SectionH2,
  SectionH3,
  ListLabel,
  BulletList,
  SectionDivider,
  Strong,
  ReadNextChapterCta,
} from "../components/how-to/prose";
import {
  ArchitectureLayersDiagram,
  AiCascadeDiagram,
  InputPipelineDiagram,
  AuthFlowDiagram,
} from "../components/how-to/build-diagrams";


/* ------------------------------------------------------------------ */
/*  Spirit OS feature callout — inline component (page-local).         */
/*  Mirrors the shared CofounderFeatureCallout structure but with      */
/*  Spirit OS labels and a /login CTA. The shared file is left         */
/*  untouched.                                                         */
/* ------------------------------------------------------------------ */

const ArrowRight = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M1 5h8M5 1l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function SpiritOSCallout({ description }: { description: string }) {
  return (
    <div className="w-full max-w-[680px] mb-[56px] rounded-[16px] border border-[#D7E8FF] bg-[#F7FBFF] flex flex-col items-center self-stretch mt-[40px]">
      <div className="w-full flex flex-col gap-[20px] items-start px-[20px] py-[22px]">
        <div className="flex w-full flex-wrap items-center justify-between gap-[12px]">
          <div className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[4px] relative overflow-hidden">
            <span className="relative font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[#007EC7] whitespace-nowrap">
              Spirit OS feature
            </span>
          </div>
          <Link
            to="/app"
            className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[33px] px-3 rounded-[8px] cta-btn-dark"
          >
            <span
              className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
              aria-hidden="true"
            />
            <span className="relative z-10 inline-flex items-center justify-center gap-[6px] font-[460] text-[13px] tracking-[0.13px] text-[#fbfbf8]">
              Launch Spirit OS
              <ArrowRight />
            </span>
          </Link>
        </div>
        <div className="w-full flex gap-[40px] items-start">
          <p className="m-0 text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.70)] max-w-[422px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function HowToBuildPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[91px] min-[1000px]:pt-[120px] pb-[120px]">
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] min-[1000px]:flex min-[1000px]:gap-[60px]">
          {/* Sidebar */}
          <aside className="hidden min-[1000px]:block w-[240px] shrink-0">
            <div className="sticky top-[120px]">
              <ChapterSidebar active="build" />
            </div>
          </aside>

          {/* Content column */}
          <div className="flex-1 max-w-[800px] min-w-0">
            {/* Hero */}
            <div id="intro">
              <div
                className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[4px] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[rgba(38,35,35,0.5)] whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(rgba(251,251,248,0.5) 0%, rgba(251,251,248,0) 100%)",
                }}
              >
                Chapter II
              </div>
              <h1
                className="m-0 text-[32px] md:text-[40px] font-normal leading-[115%] text-[rgba(38,35,35,0.95)] mt-[24px]"
                style={{
                  fontFamily:
                    "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
                }}
              >
                How we build Spirit OS
              </h1>
              <div className="mt-[32px]">
                <BodyPara>
                  A look under the hood — the architecture, the multimodal input pipeline, the AI cascade, and the security model that makes Spirit OS work.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Spirit OS is not a single program. It is three independent layers — a browser-side desktop shell, a set of multimodal input controllers, and an Express backend with an AI cascade — that talk to each other through typed interfaces. This chapter is a tour of how those pieces fit together, why each choice was made, and where the seams are if you want to extend or replace any part.
                </BodyPara>
              </div>
              <div className="py-[64px]">
                {/* Build page uses the p-[8px] variant of HERO_IMAGE_CARD */}
                <div className="rounded-[12px] border-[1.5px] border-[#E8E7E6] bg-[rgba(242,242,237,0.24)] shadow-[1px_2px_2px_0_#FFF,1px_4px_5px_0_#FFF,inset_2px_3px_4px_0_rgba(152,146,140,0.16)] overflow-hidden p-[8px]">
                  <img
                    src="/img/books-covers/Frame_2147239728.png"
                    alt="Spirit OS — how we build"
                    className="w-full h-auto block rounded-[8px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 1 — Architecture overview */}
            <div className="mt-[80px]">
              <SectionH2 id="architecture-overview">Architecture overview</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is structured as three layers. Each layer is independently swappable — the browser shell can run against a different backend, the input controllers can be replaced, and the AI cascade can be reconfigured without touching the other layers. The boundaries are deliberate: every layer talks to the next through a typed interface, with no shared global state across layers.
                </BodyPara>
              </div>

              <SectionH3>Layer 1 — Browser-side desktop shell</SectionH3>
              <BodyPara className="mt-[20px]">
                Built on Vite + React 18. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">Desktop.jsx</code> is the root component. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">WindowFrame.jsx</code> wraps every app in a draggable, resizable window powered by react-rnd. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">Taskbar.jsx</code> is the bottom bar with pinned apps, running indicators, the clock, and the SOS button. Fifteen built-in apps live in <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">src/apps/</code>: File Explorer, Terminal, Settings, Notes, Calculator, Reminders, Browser, Translator, Mail, Presentation, PDF Viewer, Image Viewer, Vault, Emergency, Known Book.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Layer 2 — Multimodal input controllers</SectionH3>
              <BodyPara className="mt-[20px]">
                <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">src/input/</code> contains five controllers: Voice, Gestures, Eye, Sign, and Face. Each controller reads from the shared camera stream (via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">sharedCamera.js</code>), runs its model, and emits intents into a single Zustand store. The desktop subscribes to the store and never cares which modality fired.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Layer 3 — Express backend</SectionH3>
              <BodyPara className="mt-[20px]">
                <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">server/index.js</code> boots an Express server with REST routes, a WebSocket server, Prisma ORM, a SQLite database, and the AI cascade (<code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">irisEngine.js</code>). Multer handles file uploads. express-session manages auth. The cascade orchestrates Gemini → Sarvam → OpenRouter → Groq → Spirit (offline), with mem0ai providing persistent memory alongside.
              </BodyPara>

              <BodyPara className="mt-[24px]">
                The data flow is one-directional and traceable: Browser → Input controllers → State stores → API calls → Express → AI cascade → Prisma → response back. Every layer has a clear contract with the next.
              </BodyPara>

              <ArchitectureLayersDiagram />

              <SpiritOSCallout description="Every layer of Spirit OS is independently swappable. Want a different LLM provider? Replace a tier in irisEngine.js. Want a custom input modality? Add a controller to src/input/. The desktop shell never needs to know." />
            </div>

            {/* Section 2 — The desktop shell */}
            <div className="mt-[80px]">
              <SectionH2 id="the-desktop-shell">The desktop shell</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  The window manager is the heart of the desktop. Every app renders inside a <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">WindowFrame.jsx</code> wrapper, which uses react-rnd for drag and resize. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">windowStore.js</code> is a Zustand + Immer store that tracks window lifecycle: which windows are open, which has focus, the z-order, the size and position of each. Apps are lazy-loaded via dynamic import — opening the PDF Viewer for the first time downloads its chunk; closing it does not unload the chunk (the desktop caches it for the session).
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The boot sequence is deliberately cinematic but short: boot screen (logo + spinner) → lock screen (face recognition unlock, or master password fallback) → desktop icon grid → taskbar → app launcher → context menus → quick settings → feature bar → SOS overlay. Each step is a Framer Motion transition — short, calm, never longer than 400ms. Reduced-Motion mode collapses every transition to a 0ms swap.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  <Strong>The taskbar is the always-visible control surface.</Strong> It shows pinned apps (always present), running apps (with a small indicator dot), the clock, the voice-controller microphone, the quick-settings gear, and the red SOS button. Right-clicking the taskbar opens a context menu with window-management shortcuts.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The app launcher is a grid view of every installed app. It supports keyboard navigation (arrow keys + Enter) and voice navigation (&ldquo;open the calculator&rdquo;). Spotlight-style global search sits on top — press Ctrl+Space, type a few letters, and matching apps and files appear.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Framer Motion handles every transition: window open/close, focus changes, taskbar hover states, app launcher enter/exit. lucide-react provides the icons. Zustand + Immer manages state — the Immer integration lets us mutate window state directly without writing immutable update code, which keeps the controller code readable.
                </BodyPara>
              </div>
            </div>

            {/* Section 3 — Multimodal input pipeline */}
            <div className="mt-[80px]">
              <SectionH2 id="multimodal-input-pipeline">Multimodal input pipeline</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Five input modalities, one shared camera, one intent stream. Each controller is independently activated and configured; the desktop never insists that you use all five.
                </BodyPara>
              </div>

              <SectionH3>Voice</SectionH3>
              <BodyPara className="mt-[20px]">
                <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">VoiceController.jsx</code> orchestrates the Web Speech API for STT, the <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">useGeminiVoice</code> hook for the Gemini Live conversational loop, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">useTTS</code> for English speech output, and <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">useSarvamTTS</code> for Indic-language speech output. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">speechBus.js</code> is the single TTS coordinator — it queues utterances and prevents overlapping speech, a common bug when multiple intents fire in quick succession. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">voiceIntents.js</code> defines the intent-matching rules: pattern-match the transcript, extract parameters, dispatch to the right action.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Gestures</SectionH3>
              <BodyPara className="mt-[20px]">
                MediaPipe Hands WASM is loaded lazily via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">loadMediaPipeHands.js</code> — only when the user enables gesture input. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">GestureController.jsx</code> runs the recognition loop: it reads frames from the shared camera, runs them through MediaPipe, and emits gesture events. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">gestureConfig.js</code> maps gestures to actions — pinch-to-click, swipe-left/right for navigation, open-palm to minimize. Calibration is stored per-user.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Eye tracking</SectionH3>
              <BodyPara className="mt-[20px]">
                A TensorFlow.js gaze estimation model runs entirely in the browser. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">EyeTracker.jsx</code> converts gaze position (in normalized screen coordinates) into a virtual cursor. Dwell time is configurable — how long the user must hold their gaze on a target before it counts as a click. The eye tracker does not replace the mouse; it supplements it. Both can be active simultaneously.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Sign language</SectionH3>
              <BodyPara className="mt-[20px]">
                A custom TF.js classifier, trained in-browser via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">trainClassifier.js</code>. The SignDataCollector UI lets the user record training samples — typically 10–20 per gesture. Once trained, the classifier runs on the shared camera stream and emits sign events. <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">signConfig.js</code> maps each sign to a desktop action: open app, close window, switch workspace.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Face recognition</SectionH3>
              <BodyPara className="mt-[20px]">
                <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">face-api.js</code> loads three models: <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">tiny_face_detector</code> (fast, lightweight), <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">face_landmark_68</code> (68-point facial landmarks), and <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">face_recognition</code> (128-dimensional face embedding). <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">FaceRecognition.jsx</code> runs detection on the shared camera stream and matches against enrolled faces. Used for lock-screen unlock and the Known Book&apos;s &ldquo;who is this?&rdquo; feature.
              </BodyPara>

              <BodyPara className="mt-[24px]">
                All five controllers share <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">sharedCamera.js</code> — a single <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">getUserMedia</code> stream that is reference-counted. The camera turns on when the first input controller activates and turns off when the last one deactivates, which saves battery and respects the user&apos;s privacy.
              </BodyPara>

              <InputPipelineDiagram />
            </div>

            {/* Section 4 — The Iris Engine AI cascade */}
            <div className="mt-[80px]">
              <SectionH2 id="the-iris-engine-ai-cascade">The Iris Engine AI cascade</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">irisEngine.js</code> is the orchestrator. It exposes a single function — <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">complete(prompt, context)</code> — and tries each tier in order. The cascade is the reason Spirit OS works on a $200 Chromebook with no API keys and on a developer workstation with five cloud providers configured. The desktop always responds.
                </BodyPara>
              </div>

              <SectionH3>1. Gemini — primary tool-calling agent</SectionH3>
              <BodyPara className="mt-[20px]">
                Uses the <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">@google/generative-ai</code> SDK. Best for complex intent, multi-step plans, and conversational follow-ups. If the request fails (network error, quota exceeded, timeout), the cascade moves to the next tier.
              </BodyPara>

              <SectionDivider />

              <SectionH3>2. Sarvam — Indic-language LLM, TTS, STT</SectionH3>
              <BodyPara className="mt-[20px]">
                Called via REST. Best for Hindi, Gujarati, Marathi, Tamil, and other Indic-language requests. Also handles translation between Indic languages and English. When the user is speaking an Indic language, Sarvam is a peer of Gemini — not just a fallback.
              </BodyPara>

              <SectionDivider />

              <SectionH3>3. OpenRouter — free-model aggregator</SectionH3>
              <BodyPara className="mt-[20px]">
                Called via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">fetch</code>. Provides access to dozens of models (Llama, Mistral, Qwen, and more) through a single API. Used as a cost-free fallback when Gemini and Sarvam are unavailable.
              </BodyPara>

              <SectionDivider />

              <SectionH3>4. Groq — fast inference</SectionH3>
              <BodyPara className="mt-[20px]">
                Used via the <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">groq-sdk</code>. Picked when latency matters more than model size — real-time chat, quick classification, short responses.
              </BodyPara>

              <SectionDivider />

              <SectionH3>5. Spirit — offline deterministic NLP</SectionH3>
              <BodyPara className="mt-[20px]">
                <Strong>No API key required.</Strong> Handles a curated set of commands — open app, close window, set reminder, read time, search files, dispatch SOS — through pattern matching. Always available, even with no internet. The Spirit tier is what makes Spirit OS usable on an airplane, in a rural clinic, or anywhere connectivity is unreliable.
              </BodyPara>

              <BodyPara className="mt-[24px]">
                <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">mem0ai</code> sits alongside the cascade and stores persistent user preferences and conversation memory. When the cascade picks a tier, mem0ai provides context — what the user has asked for before, what apps they prefer, what their accessibility profile is. After the response, mem0ai extracts and stores new facts.
              </BodyPara>

              <AiCascadeDiagram />

              <SpiritOSCallout description="Persistent memory via mem0ai means Spirit OS remembers your preferences, your reminders, and your conversation history across sessions. The assistant gets more useful the longer you use it — without re-training any model." />
            </div>

            {/* Section 5 — Virtual filesystem and document parsing */}
            <div className="mt-[80px]">
              <SectionH2 id="virtual-filesystem-and-document-parsing">Virtual filesystem and document parsing</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  The virtual filesystem lives at <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">FS_ROOT</code>, which defaults to <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">./demo-filesystem</code>. The REST API at <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">/api/fs/*</code> exposes full CRUD: list, read, write, move, copy, delete. File upload uses multer multipart middleware — large files stream to disk rather than buffering in memory, which keeps the server responsive on low-spec hardware.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The document parsing pipeline handles five formats. Once parsed, every document is indexed for vector similarity search via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">vectorSearch.js</code> — a TF-IDF implementation that runs in-process, no external vector database required.
                </BodyPara>
              </div>

              <ListLabel>The parsing pipeline:</ListLabel>
              <BulletList
                items={[
                  "PDFs — pdf-parse extracts text and metadata.",
                  ".docx — mammoth converts to clean HTML.",
                  "HTML and web pages — cheerio parses the DOM, strips scripts and styles, extracts the main content.",
                  "Images — tesseract.js runs OCR. Supports 60+ languages, including all major Indic scripts.",
                  "Plain text — UTF-8 decode, no further processing.",
                ]}
              />

              <BodyPara className="mt-[24px]">
                The user can ask the AI assistant &ldquo;find the document where I mentioned my medication schedule&rdquo; and the cascade queries the vector index, retrieves the top matches, and reads them back. The File Explorer app is the user-facing UI for browsing, opening, and managing files — it talks to the same REST API the assistant uses.
              </BodyPara>

              <SpiritOSCallout description="Document parsing and vector search happen entirely on the Spirit OS backend. No file ever leaves your machine unless you explicitly opt in to a cloud AI tier. Your medical records stay yours." />
            </div>

            {/* Section 6 — Authentication, sessions, and the Vault */}
            <div className="mt-[80px]">
              <SectionH2 id="authentication-sessions-and-the-vault">Authentication, sessions, and the Vault</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS uses session-based auth — <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">express-session</code> middleware with a SQLite-backed session store. Passwords are hashed with <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">bcryptjs</code> (10 rounds). On login, the server sets an HttpOnly session cookie; subsequent requests carry the cookie and the session middleware restores the user.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Scope-based permission middleware protects API routes. Every route declares its required scope — <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">fs:read</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">fs:write</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">vault:read</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">vault:write</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">ai:complete</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">admin</code> — and the middleware checks the user&apos;s session for that scope. Caregiver Mode adds an extra layer: sensitive scopes (<code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">fs:delete</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">vault:write</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">sos:dispatch</code>) route through an approval queue.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The Vault is a separate app with its own UI. It stores credentials, medical info, and sensitive documents. Encryption is AES-256-GCM with a key derived from the user&apos;s master password via PBKDF2 (100,000 iterations). The master password is never stored — the server holds only the derived key verifier, and even that is checked client-side after a challenge-response.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  <Strong>Why session-based and not JWT?</Strong> A desktop OS session lives for the duration of the desktop being open — typically hours to days. JWTs are stateless and short-lived; revoking one requires a server-side blocklist, which defeats the stateless benefit. Sessions map naturally to the desktop lifecycle: open the desktop, log in, get a session, use the desktop, close the desktop, session expires.
                </BodyPara>
              </div>

              <AuthFlowDiagram />
            </div>

            {/* Section 7 — Real-time events and WebSocket */}
            <div className="mt-[80px]">
              <SectionH2 id="real-time-events-and-websocket">Real-time events and WebSocket</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">server/ws.js</code> runs a WebSocket server alongside the Express HTTP server. Every connected client maintains a WebSocket connection; the server broadcasts events to all connected clients in real time.
                </BodyPara>
              </div>

              <ListLabel>Events broadcast over WebSocket:</ListLabel>
              <BulletList
                items={[
                  "New reminders — when the Reminders app fires a scheduled reminder, the WebSocket pushes a toast to every connected client.",
                  "File system changes — when one client creates or deletes a file, every other client sees the change immediately in the File Explorer.",
                  "AI agent status updates — when the Iris Engine starts a long-running task (file search, terminal command, multi-step plan), it streams status updates over WebSocket.",
                  "SOS dispatches — when a user triggers SOS, every connected caregiver client receives an immediate alert.",
                  "Caregiver approvals — when a sensitive action is requested, the caregiver&apos;s client receives the approval prompt instantly.",
                ]}
              />

              <BodyPara className="mt-[24px]">
                The <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">NotificationCenter</code> component subscribes to the WebSocket, queues notifications, and shows them as toasts in the bottom-right. Notifications are persisted — if you reload the desktop, the last 10 notifications replay.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                <Strong>Why WebSocket and not SSE?</Strong> SSE is one-directional — server to client. Spirit OS needs bidirectional communication: the client sends status pings, voice-streaming audio chunks (for future real-time voice mode), and caregiver approval responses. WebSocket is the right primitive for that. Future versions will use it for real-time collaboration — shared windows, co-editing notes, paired caregiving.
              </BodyPara>
            </div>

            {/* Section 8 — What comes next */}
            <div className="mt-[80px]">
              <SectionH2 id="what-comes-next">What comes next</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is under active development. The architecture above is the foundation; the roadmap below is what comes next. Every item is shaped by user feedback — caregivers, accessibility researchers, and the people who use Spirit OS every day.
                </BodyPara>
              </div>

              <ListLabel>On the roadmap:</ListLabel>
              <BulletList
                items={[
                  "More Indic languages — currently 20+ voice languages; we are adding more, with a focus on under-served regional languages.",
                  "More accessibility profiles — including profiles for ADHD, dyslexia, and autism-spectrum users, designed in consultation with specialists.",
                  "A public app marketplace — third-party developers will be able to build and publish Spirit OS apps using the same WindowFrame API.",
                  "A mobile companion app — remote caregiver controls, SOS push notifications, and a lightweight desktop preview.",
                  "Integration with external AAC devices — switch controllers, eye trackers (Tobii, EyeX), and braille displays.",
                ]}
              />

              <BodyPara className="mt-[24px]">
                If you are building Spirit OS for someone, the next chapter covers how to talk about it — how to describe what Spirit OS is, who it is for, and why it matters. Brand, ideal user, and the sales motion that fits an accessibility-first product.
              </BodyPara>

              <SpiritOSCallout description="Spirit OS is open source under the Apache-2.0 license. Every line of the architecture above is inspectable, forkable, and modifiable. If a layer does not fit your use case, replace it." />

              {/* Launch CTA — dark button */}
              <div className="mt-[40px]">
                <Link
                  to="/app"
                  className="group relative inline-flex items-center justify-center no-underline whitespace-nowrap cursor-pointer h-[41px] px-4 rounded-[8px] cta-btn-dark"
                >
                  <span
                    className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 inline-flex items-center justify-center gap-[8px] font-[460] text-[14px] tracking-[0.14px] text-[#fbfbf8]">
                    Launch Spirit OS
                    <ArrowRight />
                  </span>
                </Link>
              </div>

              <ReadNextChapterCta to="/how-to/sell" label="Read next chapter (III)" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

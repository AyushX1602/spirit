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
  SetupFlowDiagram,
  CascadeFallbackDiagram,
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

export default function HowToStartPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[91px] min-[1000px]:pt-[120px] pb-[120px]">
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] min-[1000px]:flex min-[1000px]:gap-[60px]">
          {/* Sidebar */}
          <aside className="hidden min-[1000px]:block w-[240px] shrink-0">
            <div className="sticky top-[120px]">
              <ChapterSidebar active="start" />
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
                Chapter I
              </div>
              <h1
                className="m-0 text-[32px] md:text-[40px] font-normal leading-[115%] text-[rgba(38,35,35,0.95)] mt-[24px]"
                style={{
                  fontFamily:
                    "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
                }}
              >
                How to start with Spirit OS
              </h1>
              <div className="mt-[32px]">
                <BodyPara>
                  Spirit OS runs entirely in the browser — no install required. This chapter walks through getting Spirit OS running, picking an accessibility profile, and issuing your first voice command.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  If you are a caregiver setting up Spirit OS for someone else, follow the same steps and then enable Caregiver Mode in Settings. The desktop adapts to the user; you stay in control of the sensitive actions.
                </BodyPara>
              </div>
              <div className="py-[64px]">
                <div className="rounded-[12px] border-[1.5px] border-[#E8E7E6] bg-[rgba(242,242,237,0.24)] shadow-[1px_2px_2px_0_#FFF,1px_4px_5px_0_#FFF,inset_2px_3px_4px_0_rgba(152,146,140,0.16)] overflow-hidden">
                  <img
                    src="/img/books-covers/Frame_2147239727test-img-2.png"
                    alt="Spirit OS — starting up"
                    className="w-full h-auto block rounded-[8px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 1 — Should you use Spirit OS? */}
            <div className="mt-[80px]">
              <SectionH2 id="should-you-use">Should you use Spirit OS?</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is built for people who find traditional operating systems hard to use. If you have low vision, limited motor control, or a cognitive condition that makes standard desktop UI confusing, Spirit OS was designed with you in mind. It is also a strong fit for caregivers supporting someone with Alzheimer&apos;s, dementia, or age-related accessibility needs — you can configure it once and the desktop adapts to them.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Educators and assistive-tech researchers use Spirit OS as a teaching and prototyping surface. Developers building accessible apps can treat it as a reference workspace: every input modality is exposed through a clean controller API, and the AI cascade is open and inspectable end to end.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Spirit OS is not for every situation. If you need native system-level access — kernel drivers, raw disk I/O, hardware telemetry — it is not the right tool. If your workload needs full GPU compute (large model training, real-time 3D rendering), stay on a native OS. And while the desktop shell is responsive, it is not optimized for mobile-only use; a phone-class screen works for quick tasks but the full experience lives on a laptop or desktop browser.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  <Strong>Spirit OS is a complementary workspace, not a replacement for your OS&apos;s accessibility settings.</Strong> You can run it alongside macOS VoiceOver, Windows Narrator, or Chrome&apos;s built-in accessibility features. Spirit OS adds a desktop layer that has accessibility as a first-class design constraint, not a retrofit.
                </BodyPara>
              </div>
              <ListLabel>Use Spirit OS if:</ListLabel>
              <BulletList
                items={[
                  "You or someone you support finds standard desktop UI hard to use.",
                  "You want voice, gesture, eye, or sign-language input built in.",
                  "You are building or testing accessible software and need a reference environment.",
                  "You want an offline-capable, privacy-respecting workspace with an AI assistant.",
                ]}
              />
            </div>

            {/* Section 2 — Setting up Spirit OS */}
            <div className="mt-[80px]">
              <SectionH2 id="setting-up">Setting up Spirit OS</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Prerequisites are minimal: a modern browser (Chrome, Edge, or Firefox, latest two versions), a webcam and microphone for full multimodal input, and optional internet access for cloud AI. Without internet, Spirit OS falls back to the Spirit NLP engine — core functionality stays intact.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Clone the repository, then run <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">npm install</code> in both <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">server/</code> and <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">client/</code>. Configure <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">server/.env</code> with <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">SESSION_SECRET</code> (required), <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">DATABASE_URL</code> (defaults to a local SQLite file), and any optional AI keys: <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">GEMINI_API_KEY</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">SARVAM_API_KEY</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">OPENROUTER_API_KEY</code>, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">GROQ_API_KEY</code>.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Run <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">npm run db:generate</code> in <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">server/</code> to create the Prisma client and apply the schema, then run <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">npm run dev</code> in both folders. The client is served at <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">http://localhost:5173</code> and the API at <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">http://localhost:3001</code>. On Windows, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">start-demo.cmd</code> runs every step in sequence as a one-click launcher.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  <Strong>The whole stack works fully offline with the Spirit NLP fallback.</Strong> Cloud keys unlock richer AI capabilities — multi-step planning, Indic-language translation, conversational follow-ups — but they are not required to use the desktop, the file system, the apps, or the multimodal input controllers.
                </BodyPara>
              </div>

              <SetupFlowDiagram />

              <SpiritOSCallout description="Spirit OS ships with a one-click Windows launcher (start-demo.cmd) that runs install, database setup, and both dev servers in sequence — no manual terminal hopping required." />
            </div>

            {/* Section 3 — Pick an accessibility profile */}
            <div className="mt-[80px]">
              <SectionH2 id="pick-profile">Pick an accessibility profile</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS ships with five built-in accessibility profiles, available in Settings → Accessibility → Profiles. Each profile adjusts theme, font scale, animation timing, and input modalities as a coordinated set — you do not have to toggle ten individual settings.
                </BodyPara>
              </div>

              <SectionH3>High-Contrast</SectionH3>
              <BodyPara className="mt-[20px]">
                Boosts text contrast, swaps the soft cream surface for a high-contrast dark theme, and thickens borders on every focusable element. Helpful for low-vision users and anyone working in bright ambient light.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Large-Font</SectionH3>
              <BodyPara className="mt-[20px]">
                Increases the base font scale from 15px to 18px or 20px, scales window chrome proportionally, and widens clickable hit areas. The taskbar grows with the font, so it never becomes hard to read.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Reduced-Motion</SectionH3>
              <BodyPara className="mt-[20px]">
                Disables Framer Motion transitions, replaces sliding windows with instant swaps, and shortens the SOS toast duration. Useful for users with vestibular sensitivities or anyone who finds animations distracting.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Caregiver Mode</SectionH3>
              <BodyPara className="mt-[20px]">
                Adds approval flows for sensitive actions: file deletion, vault access, SOS dispatch, and AI-initiated terminal commands. The user keeps full agency over day-to-day actions; anything that crosses the configured sensitivity threshold routes through an approval queue that a caregiver accepts or denies from a paired device.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Alzheimer Support Mode</SectionH3>
              <BodyPara className="mt-[20px]">
                Combines large fonts, high contrast, simplified navigation, persistent reminders, and the Known Book — a visual contact list with photos. Reduces visual clutter, hides advanced features behind a &ldquo;More&rdquo; toggle, and surfaces the people and routines that matter most to the user.
              </BodyPara>

              <BodyPara className="mt-[24px]">
                To enable a profile, open Settings → Accessibility → Profiles and pick one. You can switch profiles at any time — the change is instant and reversible. Profiles are stored per-user in the database, so they persist across sessions.
              </BodyPara>

              <SpiritOSCallout description="Alzheimer Support Mode is the result of months of caregiver interviews. It bundles the configuration that matters most — large fonts, persistent reminders, the Known Book, and a simplified taskbar — into a single switch." />
            </div>

            {/* Section 4 — Calibrate input modalities */}
            <div className="mt-[80px]">
              <SectionH2 id="calibrate">Calibrate input modalities</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS supports five input modalities. <Strong>All are optional</Strong> — the desktop works with just a keyboard and mouse. Each modality has its own calibration flow, and every calibration is stored per-user so it survives across sessions.
                </BodyPara>
              </div>

              <SectionH3>Voice</SectionH3>
              <BodyPara className="mt-[20px]">
                Open Settings → Input → Voice. Pick a language from the 20+ options in <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">voiceLanguages.js</code>. Test the microphone. Optionally train a wake word (the default is &ldquo;spirit&rdquo;). The Web Speech API handles browser-side STT; if you are online and have a Gemini key, the <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">useGeminiVoice</code> hook upgrades you to the Gemini Live conversational loop.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Gestures</SectionH3>
              <BodyPara className="mt-[20px]">
                Open Settings → Input → Gestures. The MediaPipe Hands WASM module loads lazily via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">loadMediaPipeHands.js</code>. Define a pinch threshold (the distance at which a pinch-to-click registers) and swipe sensitivity (how far a hand has to travel to count as a swipe). <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">gestureConfig.js</code> maps each gesture to an action: pinch-to-click, swipe-to-navigate, open-palm-to-minimize.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Eye tracking</SectionH3>
              <BodyPara className="mt-[20px]">
                Open Settings → Input → Eye Tracking. The TensorFlow.js gaze model loads, then walks you through a 30-second calibration: a dot moves to nine positions on screen and you follow it with your eyes. After calibration, gaze position drives the cursor. Configure dwell time (how long you hold your gaze on a target before it counts as a click) — 800ms is a good default.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Sign language</SectionH3>
              <BodyPara className="mt-[20px]">
                Open Settings → Input → Sign Language. Use the SignDataCollector UI to record 10–20 samples per gesture. The custom TF.js classifier trains in-browser via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">trainClassifier.js</code> — typically under a minute on a modern laptop. Once trained, <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">signConfig.js</code> maps each sign to a desktop action: open app, close window, switch workspace.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Face recognition</SectionH3>
              <BodyPara className="mt-[20px]">
                Open Settings → Input → Face Recognition. Enroll one or more faces using <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">face-api.js</code> (tiny_face_detector + face_landmark_68 + face_recognition models). On the lock screen, the camera runs detection against the shared camera stream and unlocks the desktop when it recognizes an enrolled face.
              </BodyPara>

              <BodyPara className="mt-[24px]">
                All five modalities share a single camera stream via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">sharedCamera.js</code> — no need to grant camera permission five times. The camera turns on when the first input controller activates and turns off when the last one deactivates.
              </BodyPara>
            </div>

            {/* Section 5 — Issue your first voice command */}
            <div className="mt-[80px]">
              <SectionH2 id="first-command">Issue your first voice command</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Open the Voice Controller — the microphone icon in the taskbar. It supports two modes: push-to-talk (hold the icon, speak, release) and wake-word (say &ldquo;spirit&rdquo; then your command). Try these English commands:
                </BodyPara>
              </div>
              <BulletList
                items={[
                  "“open the file explorer”",
                  "“set a reminder for 5 PM to take medication”",
                  "“what time is it”",
                  "“search the web for accessible computing guidelines”",
                ]}
              />
              <BodyPara className="mt-[24px]">
                For Indic languages, switch the voice language in Settings and try Hindi commands like:
              </BodyPara>
              <BulletList
                items={[
                  "“फ़ाइल एक्सप्लोरर खोलो”",
                  "“मेरे लिए रिमाइंडर सेट कर दो रोज 5:00 p.m दवाई लेने के लिए”",
                ]}
              />
              <BodyPara className="mt-[24px]">
                The <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">indianVoiceNormalize.js</code> library handles STT transcription errors and maps phonetic variations to canonical commands. If you say &ldquo;खोलो&rdquo;, &ldquo;खोल&rdquo;, or &ldquo;खोलिए&rdquo;, all three resolve to the same open-app intent. The desktop never insists on exact phrasing.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                If you are online, the Gemini → Sarvam cascade handles complex intent — multi-step commands, conversational follow-ups, and natural-language file searches. If you are offline, the Spirit NLP engine handles deterministic commands (open, close, set reminder, read time, search) without any network call. <Strong>The desktop always responds.</Strong>
              </BodyPara>

              <CascadeFallbackDiagram />

              <SpiritOSCallout description="Indic-language normalization is built into the voice pipeline — Spirit OS recognizes regional pronunciation variants in Hindi, Gujarati, Marathi, Tamil, and more, and maps them to the same canonical command." />
            </div>

            {/* Section 6 — Take the leap */}
            <div className="mt-[80px]">
              <SectionH2 id="take-the-leap">Take the leap</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  At this point you have Spirit OS running, an accessibility profile picked, input modalities calibrated, and your first voice command issued. Four more steps make the desktop fully configured for daily use.
                </BodyPara>
              </div>

              <SectionH3>Set up the SOS panel</SectionH3>
              <BodyPara className="mt-[20px]">
                Open the SOS app and add 1–3 emergency contacts (phone, email, or both). When the user triggers SOS — by voice (&ldquo;call for help&rdquo;), by gesture (a configured sign), or by clicking the red SOS button in the feature bar — Spirit OS dispatches a notification to every contact with the user&apos;s location and a configurable message.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Enroll trusted contacts in the Known Book</SectionH3>
              <BodyPara className="mt-[20px]">
                Open the Known Book app, add each person&apos;s name, photo, and relationship. The next time they are recognized on the camera (via <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] text-[rgba(38,35,35,0.95)]">face-api.js</code>), Spirit OS shows a friendly reminder — &ldquo;This is your daughter, Priya.&rdquo; — useful for users with memory conditions.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Configure the Vault</SectionH3>
              <BodyPara className="mt-[20px]">
                Open the Vault app, set a master password, and store credentials, medical info, or any sensitive documents. The Vault uses AES encryption; without the master password, the data is unreadable. Caregiver Mode routes vault access through the approval queue.
              </BodyPara>

              <SectionDivider />

              <SectionH3>Set recurring reminders</SectionH3>
              <BodyPara className="mt-[20px]">
                Open the Reminders app and add medication schedules, appointments, or daily routines. Reminders fire on the desktop, are spoken aloud via the speech coordinator, and persist across sessions.
              </BodyPara>

              <SpiritOSCallout description="Persistent memory via mem0ai lets Spirit OS remember your reminders, your contacts, your accessibility preferences, and your conversation history — across sessions, across devices, across reboots." />

              {/* Closer */}
              <div className="mt-[40px]">
                <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.5)]">
                  What comes next:
                </p>
                <BodyPara className="mt-[12px]">
                  Spirit OS is now ready for daily use. The next chapter goes under the hood — how the desktop shell, the multimodal input pipeline, the AI cascade, and the security model fit together.
                </BodyPara>
              </div>

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

              <ReadNextChapterCta to="/how-to/build" label="Read next chapter (II)" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

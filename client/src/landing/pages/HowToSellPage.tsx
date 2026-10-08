import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import { SpiritFeatureCallout } from "../components/how-to/spirit-callout";
import { ChapterSidebar } from "../components/how-to/chapter-sidebar";
import { DiagramPill } from "../components/how-to/diagram-pill";
import {
  BodyPara,
  SectionH2,
  ListLabel,
  BulletList,
  Strong,
  ReadNextChapterCta,
} from "../components/how-to/prose";


/* ------------------------------------------------------------------ */
/*  Local helpers — Launch Spirit OS dark CTA                            */
/* ------------------------------------------------------------------ */

function LaunchSpiritOSCta() {
  return (
    <div className="mt-[40px]">
      <a
        to="/app"
        className="group relative inline-flex h-[41px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] px-[20px] cta-btn-dark"
      >
        <span
          className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
          aria-hidden="true"
        />
        <span className="relative z-10 inline-flex items-center justify-center gap-[6px] font-[460] text-[15px] tracking-[0.15px] text-[#fbfbf8]">
          Launch Spirit OS
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 6h10M6 1l5 5-5 5"
              stroke="#fbfbf8"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGRAM 1 — WHO BENEFITS (6 user-type cards in a 2x3 grid)          */
/* ------------------------------------------------------------------ */

function WhoBenefitsDiagram() {
  const cards = [
    {
      title: "Low-vision users",
      desc: "High-contrast & large-font profiles, voice-first navigation, spoken reminders.",
    },
    {
      title: "Motor-impaired users",
      desc: "Hand gestures, eye tracking, sign language input — no precise mouse movements.",
    },
    {
      title: "Elderly users",
      desc: "Large-text UI, simplified desktop, spoken reminders, Known Book, SOS panel.",
    },
    {
      title: "Alzheimer's caregivers",
      desc: "Alzheimer Support Mode, guided navigation, persistent memory, Caregiver Mode.",
    },
    {
      title: "Indic-language speakers",
      desc: "Sarvam AI for Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, and more.",
    },
    {
      title: "Developers & educators",
      desc: "Open source (MIT), extensible apps, extensible AI cascade, lab-ready.",
    },
  ];
  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Who benefits</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          Spirit OS is built for the billion users that traditional operating
          systems leave behind.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-[12px] border border-[#E8E7E6] bg-[rgba(242,242,237,0.40)] px-[16px] py-[14px] flex flex-col gap-[6px]"
          >
            <p className="m-0 text-[14px] font-[530] leading-[140%] tracking-[0.14px] text-[rgba(38,35,35,0.95)]">
              {c.title}
            </p>
            <p className="m-0 text-[13px] font-[460] leading-[150%] tracking-[0.13px] text-[rgba(38,35,35,0.65)]">
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGRAM 2 — COMPARISON TABLE (4 columns x 6 rows)                   */
/* ------------------------------------------------------------------ */

function ComparisonTableDiagram() {
  const cols = [
    "Spirit OS",
    "OS accessibility settings",
    "Screen readers",
    "Switch-control hardware",
  ];
  const rows: { label: string; cells: string[] }[] = [
    {
      label: "Cost",
      cells: ["Free / open source", "Free", "$$$ licenses", "$$$ hardware"],
    },
    {
      label: "Install",
      cells: ["Open a URL", "Built into OS", "Install + configure", "Buy + pair"],
    },
    {
      label: "Modalities",
      cells: [
        "Voice, gesture, eye, sign, face",
        "Magnifier, voiceover",
        "DOM narration only",
        "Single switch or scan",
      ],
    },
    {
      label: "Offline use",
      cells: ["Yes (Spirit NLP fallback)", "Yes", "Yes", "Yes"],
    },
    {
      label: "Indic language support",
      cells: ["Built-in (Sarvam)", "Limited", "Limited", "None"],
    },
    {
      label: "Extensibility",
      cells: ["Full app + AI cascade", "Read-only settings", "Read-only", "Read-only"],
    },
  ];

  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Comparison table</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          Spirit OS is a full workspace — not just settings, not just narration,
          and not single-purpose hardware.
        </span>
      </div>
      <div className="rounded-[12px] border border-[#E8E7E6] bg-[rgba(242,242,237,0.30)] overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] border-b border-[#E8E7E6] bg-[rgba(242,242,237,0.60)]">
          <div className="p-[10px_12px]" />
          {cols.map((c, i) => (
            <div
              key={c}
              className={`p-[10px_12px] text-[11px] font-[family-name:var(--font-ibm-plex-mono)] font-medium leading-[140%] tracking-[0.11px] uppercase border-l border-[#E8E7E6] ${
                i === 0
                  ? "text-[#1a6fd1] bg-[#F7FBFF]"
                  : "text-[rgba(38,35,35,0.6)]"
              }`}
            >
              {c}
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`grid grid-cols-[140px_1fr_1fr_1fr_1fr] ${
              i < rows.length - 1 ? "border-b border-[#E8E7E6]" : ""
            }`}
          >
            <div className="p-[10px_12px] text-[11px] font-[family-name:var(--font-ibm-plex-mono)] font-medium leading-[140%] tracking-[0.11px] uppercase text-[rgba(38,35,35,0.6)] flex items-center">
              {r.label}
            </div>
            {r.cells.map((cell, j) => (
              <div
                key={j}
                className={`p-[10px_12px] text-[13px] font-[460] leading-[150%] tracking-[0.13px] border-l border-[#E8E7E6] ${
                  j === 0
                    ? "text-[rgba(38,35,35,0.95)] bg-[#F7FBFF] font-[530]"
                    : "text-[rgba(38,35,35,0.70)]"
                }`}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGRAM 3 — ACCESSIBILITY PROFILES (5 profile cards)                */
/* ------------------------------------------------------------------ */

function AccessibilityProfilesDiagram() {
  const profiles = [
    {
      name: "High-contrast",
      desc: "Maximum foreground/background contrast for low-vision users.",
    },
    {
      name: "Large-font",
      desc: "Oversized typography and touch targets across every app.",
    },
    {
      name: "Reduced-motion",
      desc: "Strips Framer Motion transitions to ease cognitive load.",
    },
    {
      name: "Caregiver Mode",
      desc: "Remote approval for sensitive actions and full audit log.",
    },
    {
      name: "Alzheimer Support",
      desc: "Guided navigation, persistent memory, simplified desktop.",
    },
  ];
  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Accessibility profiles</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          One Spirit OS install, five switchable profiles — and you can build
          more.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {profiles.map((p, i) => (
          <div
            key={p.name}
            className={`rounded-[12px] border px-[16px] py-[14px] flex flex-col gap-[6px] ${
              i === 0
                ? "border-[rgba(26,111,209,0.30)] bg-[#F7FBFF]"
                : "border-[#E8E7E6] bg-[rgba(242,242,237,0.40)]"
            }`}
          >
            <p className="m-0 text-[14px] font-[530] leading-[140%] tracking-[0.14px] text-[rgba(38,35,35,0.95)]">
              {p.name}
            </p>
            <p className="m-0 text-[13px] font-[460] leading-[150%] tracking-[0.13px] text-[rgba(38,35,35,0.65)]">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function HowToSellPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[91px] min-[1000px]:pt-[120px] pb-[120px]">
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] min-[1000px]:flex min-[1000px]:gap-[60px]">
          {/* Sidebar */}
          <aside className="hidden min-[1000px]:block w-[240px] shrink-0">
            <div className="sticky top-[120px]">
              <ChapterSidebar active="sell" />
            </div>
          </aside>

          {/* Content column */}
          <div className="flex-1 max-w-[800px] min-w-0">
            {/* ===================== HERO ===================== */}
            <div id="intro">
              <div
                className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[4px] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[rgba(38,35,35,0.5)] whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(rgba(251,251,248,0.5) 0%, rgba(251,251,248,0) 100%)",
                }}
              >
                Chapter III
              </div>
              <h1
                className="m-0 text-[32px] md:text-[40px] font-normal leading-[115%] text-[rgba(38,35,35,0.95)] mt-[24px]"
                style={{ fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif" }}
              >
                Spirit OS selling points
              </h1>
              <div className="mt-[32px]">
                <BodyPara>
                  Spirit OS is built for the billion users that traditional
                  operating systems leave behind. This chapter walks through who
                  benefits, why it matters, and what makes Spirit OS different
                  from screen readers, accessibility settings, and other
                  assistive tools.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  If you are evaluating Spirit OS for a school, clinic, eldercare
                  facility, or for a family member, this chapter is for you.
                </BodyPara>
              </div>

              {/* Who benefits diagram (right after hero) */}
              <WhoBenefitsDiagram />
            </div>

            {/* Lead callout (right after hero, before Section 1) */}
            <SpiritFeatureCallout
              label="Spirit OS feature"
              description="Spirit OS runs entirely in the browser — no install, no per-machine setup. The same URL works for a single user at home, a classroom of students, or a wing of an eldercare facility. Voice, gestures, eye tracking, sign language, and the Iris AI assistant all work out of the box."
            />

            {/* ===================== SECTION 1 — For low-vision users ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-low-vision-users">For low-vision users</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Traditional operating systems treat low vision as a settings
                  problem — crank up the magnifier, invert the colors, and hope
                  the user can find the cursor. Spirit OS treats it as a
                  workspace problem.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>High-contrast profile</Strong> rebuilds the entire
                  desktop with maximum foreground-background contrast — not a
                  tint overlay, but a from-skin-to-app reskin. The{" "}
                  <Strong>Large-font profile</Strong> scales typography and touch
                  targets across every window, taskbar, and app. Either profile
                  can be enabled from Settings or by voice command.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The desktop is also <Strong>voice-first</Strong>. The entire
                  workspace can be operated by voice alone — open apps, navigate
                  files, set reminders, dictate text, run terminal commands.
                  Spoken reminders and notifications use TTS via Sarvam, with
                  full Indic language support, so the OS speaks to the user in
                  their language. A spotlight-style global search accepts voice
                  input by default.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Unlike traditional screen readers that read the underlying DOM,
                  Spirit OS speaks the <Strong>desktop metaphor</Strong> —
                  &ldquo;File Explorer window, focused, 3 files selected&rdquo;
                  — making it intuitive for users who think in terms of objects
                  on a desk, not HTML elements. A low-vision user does not need
                  to learn what a &lt;div&gt; is to know what is on their screen.
                </BodyPara>
              </div>

              <ListLabel>What low-vision users get out of the box:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>High-contrast profile</Strong> — full-desktop reskin,
                    not a tint overlay.
                  </>,
                  <>
                    <Strong>Large-font profile</Strong> — scaled typography and
                    touch targets in every app.
                  </>,
                  <>
                    <Strong>Voice-first navigation</Strong> — operate the entire
                    desktop by voice alone.
                  </>,
                  <>
                    <Strong>Spoken reminders</Strong> — TTS via Sarvam with
                    Indic language support.
                  </>,
                  <>
                    <Strong>Spotlight search</Strong> — voice-driven global
                    search across apps and files.
                  </>,
                ]}
              />

              <AccessibilityProfilesDiagram />

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="Spirit OS speaks the desktop metaphor, not the DOM. When the assistant describes what is on screen, it says 'File Explorer window, focused, 3 files selected' — not 'list with three list items'. Users think in terms of objects on a desk, and Spirit OS speaks the same way."
              />
            </div>

            {/* ===================== SECTION 2 — For motor-impaired users ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-motor-impaired-users">For motor-impaired users</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  For users who cannot reliably operate a mouse or keyboard,
                  Spirit OS ships with three hands-free modalities — all running
                  on the user&apos;s existing webcam and microphone.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  <Strong>Hand gestures</Strong> use MediaPipe Hands WASM to
                  recognize pinch-to-click, swipe, and other gestures in real
                  time. <Strong>Eye tracking</Strong> uses TensorFlow.js to move
                  the cursor where the user looks, with dwell-to-click so a
                  sustained gaze registers as a click. <Strong>Sign language
                  input</Strong> uses a custom TensorFlow classifier trained on
                  the user&apos;s own signs, so the user can issue any command
                  in their preferred vocabulary.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  No more precise mouse movements — the cursor moves where you
                  look, and you click by dwelling or pinching. The Voice
                  Controller can also issue any command, so the user always has
                  a fallback when their hands, eyes, or signs are tired.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Compare this to traditional switch-accessibility tools:
                  Spirit OS ships with all modalities built in, no expensive
                  hardware required — just a webcam and microphone that ship
                  with virtually every laptop. A school can deploy Spirit OS in
                  a computer lab today, without procurement, without drivers,
                  and without IT tickets.
                </BodyPara>
              </div>

              <ListLabel>Three hands-free modalities, one webcam:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>Hand gestures</Strong> — pinch-to-click, swipe, and
                    custom gestures via MediaPipe Hands WASM.
                  </>,
                  <>
                    <Strong>Eye tracking</Strong> — cursor follows gaze,
                    dwell-to-click via TensorFlow.js.
                  </>,
                  <>
                    <Strong>Sign language input</Strong> — custom TF classifier
                    trained on the user&apos;s own signs.
                  </>,
                  <>
                    <Strong>Voice Controller</Strong> — any command by voice,
                    with Indic language normalization.
                  </>,
                ]}
              />

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="All three hands-free modalities — hand gestures, eye tracking, and sign language — run on the user's existing webcam and microphone. No expensive switch-control hardware, no drivers, no IT procurement. Spirit OS makes accessibility a software problem, not a hardware budget."
              />
            </div>

            {/* ===================== SECTION 3 — For elderly users ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-elderly-users">For elderly users</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Most operating systems were designed for office workers in
                  their thirties. Spirit OS is designed for everyone&apos;s
                  parents and grandparents — a desktop that feels familiar but
                  does not punish slowing hands or fading eyesight.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The default UI uses <Strong>large text</Strong> and a{" "}
                  <Strong>simplified desktop with fewer icons</Strong>. The
                  desktop feels familiar — like Windows or macOS — but with
                  everything enlarged, simplified, and voice-enabled. There is
                  no Start menu labyrinth; the App Launcher is a single grid
                  with the apps the user actually uses.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Spoken reminders handle medications and appointments, with
                  recurring schedule support. Hindi voice commands work out of
                  the box — a user can say:
                </BodyPara>
                <blockquote className="mt-[24px] rounded-[12px] border border-[rgba(190,190,190,0.30)] bg-[rgba(242,242,237,0.40)] px-[24px] py-[16px] m-0">
                  <p className="m-0 italic text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)]">
                    &ldquo;मेरे लिए रिमाइंडर सेट कर दो रोज 5:00 p.m दवाई लेने के
                    लिए&rdquo;
                  </p>
                  <p className="m-0 mt-[10px] text-[12px] font-[460] leading-[150%] tracking-[0.12px] text-[rgba(38,35,35,0.55)]">
                    (Set me a reminder for 5:00 p.m. every day to take my
                    medicine.)
                  </p>
                </blockquote>
                <BodyPara className="mt-[20px]">
                  The <Strong>Known Book</Strong> keeps trusted contacts with
                  photos and one-tap call shortcuts — the user does not need to
                  remember a phone number or scroll through a contact list. The{" "}
                  <Strong>SOS panel</Strong> dispatches to a configurable list of
                  emergency contacts in one tap. For an elderly user living
                  alone, that is the difference between a fall and a tragedy.
                </BodyPara>
              </div>

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="The Reminder System supports recurring schedules — daily medication, weekly check-ins, monthly appointments — and accepts voice commands in Indic languages. The Known Book pairs photos with one-tap call shortcuts, so an elderly user never has to remember a phone number."
              />
            </div>

            {/* ===================== SECTION 4 — For Alzheimer's and dementia caregivers ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-alzheimers-and-dementia-caregivers">For Alzheimer&apos;s and dementia caregivers</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Dementia care is not a settings problem. It is a patience
                  problem, a repetition problem, and a safety problem. Spirit OS
                  ships an <Strong>Alzheimer Support Mode</Strong> that addresses
                  all three.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The mode replaces the standard desktop with a{" "}
                  <Strong>simplified UI and guided navigation</Strong>. The{" "}
                  <Strong>usePathGuidance</Strong> hook walks the user through
                  multi-step tasks one step at a time — &ldquo;Now tap
                  File Explorer. Now tap Documents. Now tap the file named
                  Appointment.&rdquo; — instead of leaving them stranded in a
                  filesystem. Text is large, animations are reduced-motion, and
                  every screen has a clear single next step.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The Iris assistant has <Strong>persistent memory via
                  mem0ai</Strong>. It remembers the user&apos;s name, their
                  preferences, the names of their family members, and the
                  questions they ask repeatedly. A user who asks &ldquo;What
                  day is it?&rdquo; five times in an hour gets the same
                  consistent answer, in the same warm tone, every time. The
                  assistant does not get frustrated.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>Known Book</Strong> pairs photos of family and
                  caregivers with face recognition — the user can ask &ldquo;Who
                  is this person?&rdquo; while looking at a photo, and Spirit OS
                  will recognize and name them. Spoken reminders handle daily
                  routines: morning medication, lunch, afternoon walk, evening
                  call with a family member.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For caregivers, <Strong>Caregiver Mode</Strong> adds remote
                  approval for sensitive actions. File deletion, SOS dispatch,
                  and Vault access all require caregiver approval before they
                  proceed. Every action taken is logged to an audit trail the
                  caregiver can review. The caregiver can be in the next room or
                  on another continent.
                </BodyPara>
              </div>

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="Alzheimer Support Mode pairs guided navigation (the usePathGuidance hook walks users through multi-step tasks) with persistent memory via mem0ai. The assistant remembers the user's name, preferences, family members, and recurring questions — and never gets frustrated answering the same question twice."
              />

              <SpiritFeatureCallout
                label="Caregiver approval flows"
                description="Caregiver Mode requires remote approval for sensitive actions — file deletion, SOS dispatch, Vault access — and logs every action to an auditable trail. A caregiver can be in the next room or on another continent, and still stay in the loop."
              />
            </div>

            {/* ===================== SECTION 5 — For Indic-language speakers ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-indic-language-speakers">For Indic-language speakers</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Most operating systems are English-first with translation
                  bolted on. Spirit OS is <Strong>Indic-first</Strong>. Sarvam
                  AI is integrated for Hindi, Gujarati, Marathi, Tamil, Telugu,
                  Bengali, and more — not as a localization layer, but as a
                  first-class part of the AI cascade.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Voice commands work in any Indic language. The{" "}
                  <Strong>indianVoiceNormalize.js</Strong> library handles STT
                  errors and maps variations to canonical commands. A user who
                  says &ldquo;file kholo&rdquo;, &ldquo;file khole&rdquo;, or
                  &ldquo;file open karo&rdquo; all get the same File Explorer
                  launch. TTS output uses the user&apos;s preferred language, so
                  reminders and notifications are spoken in a tongue the user
                  dreams in.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>Translator app</Strong> provides real-time text
                  translation across 20+ languages, with the same Sarvam-backed
                  quality for Indic pairs. This is not a translation layer on
                  top of an English-first OS — Spirit OS is built Indic-first,
                  with English as one of many supported languages, not the
                  default.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For a Hindi-speaking grandmother in Lucknow, a Tamil-speaking
                  grandfather in Madurai, or a Marathi-speaking stroke survivor
                  in Pune, Spirit OS is the first operating system that meets
                  them in their language — not the other way around.
                </BodyPara>
              </div>

              <SpiritFeatureCallout
                label="Indic language normalization"
                description="The indianVoiceNormalize.js library handles STT errors and maps regional variations to canonical commands. 'file kholo', 'file khole', and 'file open karo' all resolve to the same File Explorer launch — so the user does not have to learn a command grammar, just speak."
              />
            </div>

            {/* ===================== SECTION 6 — For developers and educators ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="for-developers-and-educators">For developers and educators</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is <Strong>open source under the Apache-2.0 license</Strong>.
                  The full system — frontend, backend, AI cascade, ML pipelines
                  — is on the repository, with documentation that walks through
                  every layer. There is no &ldquo;enterprise&rdquo; SKU held
                  back behind a sales call.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The app system is <Strong>extensible by design</Strong>. Add a
                  new app by creating{" "}
                  <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] font-medium text-[rgba(38,35,35,0.9)] bg-[rgba(242,242,237,0.60)] border border-[#E8E7E6] rounded-[6px] px-[6px] py-[1px]">
                    client/src/apps/YourApp/index.jsx
                  </code>{" "}
                  and registering it in{" "}
                  <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] font-medium text-[rgba(38,35,35,0.9)] bg-[rgba(242,242,237,0.60)] border border-[#E8E7E6] rounded-[6px] px-[6px] py-[1px]">
                    config/appConfig.js
                  </code>
                  . The new app immediately inherits Spirit OS&apos;s
                  accessibility profiles, voice control, and the Iris assistant
                  — no extra wiring.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The AI cascade is also extensible. Add a new provider by
                  extending{" "}
                  <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[13px] font-medium text-[rgba(38,35,35,0.9)] bg-[rgba(242,242,237,0.60)] border border-[#E8E7E6] rounded-[6px] px-[6px] py-[1px]">
                    irisEngine.js
                  </code>{" "}
                  — Gemini, Sarvam, OpenRouter/Groq, and the offline Spirit NLP
                  fallback all share a common interface. A research lab can plug
                  in their own model without forking the OS.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For sign-language support, the{" "}
                  <Strong>SignDataCollector UI</Strong> and training pipeline
                  let a developer train a custom classifier on the signs of
                  their community — Indian Sign Language, Pakistani Sign
                  Language, or a regional variant. Spirit OS does not assume one
                  sign language fits all.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Schools can deploy Spirit OS in a computer lab. Students get
                  an accessible workspace on any browser, no install per
                  machine. A school that already has Chromebooks or shared
                  Windows PCs does not need to buy new hardware — they need a
                  URL.
                </BodyPara>
              </div>

              <ListLabel>How to extend Spirit OS:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>Add an app</Strong> — drop a file in{" "}
                    <code className="font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium text-[rgba(38,35,35,0.9)] bg-[rgba(242,242,237,0.60)] border border-[#E8E7E6] rounded-[6px] px-[6px] py-[1px]">
                      client/src/apps/
                    </code>{" "}
                    and register it in appConfig.js.
                  </>,
                  <>
                    <Strong>Add an AI provider</Strong> — extend irisEngine.js
                    with a new adapter; the cascade handles the rest.
                  </>,
                  <>
                    <Strong>Train a sign classifier</Strong> — use the
                    SignDataCollector UI to gather signs and retrain the TF
                    model.
                  </>,
                  <>
                    <Strong>Deploy in a school</Strong> — point student browsers
                    at one URL. No install, no per-machine setup.
                  </>,
                ]}
              />

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="The full system is MIT-licensed and documented. The app system, the AI cascade, and the sign-language training pipeline are all extensible. A school, a research lab, or a clinic can fork, extend, and ship without asking anyone for permission."
              />
            </div>

            {/* ===================== SECTION 7 — What makes Spirit OS different ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="what-makes-spirit-os-different">What makes Spirit OS different</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is not a better screen reader. It is not a more
                  powerful accessibility settings panel. It is not a cheaper
                  switch-control device. It is a different category of product,
                  and the difference matters.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Compared to <Strong>traditional OS accessibility
                  settings</Strong>: Spirit OS is a full workspace, not just
                  settings. Settings toggle features that exist within an
                  English-first, mouse-first, office-worker-first operating
                  system. Spirit OS is built accessibility-first — every app,
                  every interaction, every default is designed for users who
                  need it.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Compared to <Strong>screen readers</Strong>: screen readers
                  narrate the DOM. They tell you what HTML element has focus.
                  Spirit OS speaks the desktop metaphor — windows, files, apps,
                  taskbar — because users think in terms of objects on a desk,
                  not in terms of document object models.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Compared to <Strong>switch-control hardware</Strong>: Spirit OS
                  uses the built-in webcam and microphone. There is no
                  procurement, no driver installation, no per-device cost. A
                  clinic can install Spirit OS on every workstation in an
                  afternoon.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Compared to <Strong>other AAC apps</Strong>: most augmentative
                  and alternative communication apps are single-purpose — a
                  symbol board, a voice generator, a phrase builder. Spirit OS
                  is a full desktop OS. It has a file system, a terminal, a
                  browser, a mail client, a Vault, a Known Book, and 15 built-in
                  apps — all under one accessibility-first shell.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  And Spirit OS is also <Strong>fully functional offline</Strong>.
                  The Spirit NLP fallback engine handles deterministic commands
                  without any API keys — open apps, set reminders, run terminal
                  commands, manage files. A user without internet, without API
                  credits, and without a paid account still has a working,
                  accessible operating system.
                </BodyPara>
              </div>

              <ComparisonTableDiagram />

              <SpiritFeatureCallout
                label="Works fully offline"
                description="The Spirit NLP fallback engine handles deterministic commands — open apps, set reminders, run terminal commands, manage files — without any API keys. A user without internet, without API credits, and without a paid account still has a working, accessible operating system."
              />
            </div>

            {/* ===================== CLOSING — What comes next + Read next chapter ===================== */}
            <div className="mt-[80px]">
              <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.5)]">
                What comes next:
              </p>
              <BodyPara className="mt-[12px]">
                Once Spirit OS is running for one user, the next question is how
                to extend it to a school, a clinic, an eldercare facility, or
                millions of users — without losing what makes it accessible.
                That is what Chapter IV covers.
              </BodyPara>
              <ReadNextChapterCta to="/how-to/scale" label="Read next chapter (IV)" />

              <LaunchSpiritOSCta />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

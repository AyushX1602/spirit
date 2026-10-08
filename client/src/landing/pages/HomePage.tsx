import { Link } from "react-router-dom";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";
import {
  CTAButton,
  GlassPillButton,
  LightSurfaceButton,
  Reveal,
  Section,
} from "../components/site/primitives";
import { LandingHero } from "../components/site/sections/landing-hero";
import { DashboardMockup } from "../components/site/sections/dashboard-mockup";

const NAV_LINKS = [
  { label: "Start", href: "/how-to/start" },
  { label: "Build", href: "/how-to/build" },
  { label: "Sell", href: "/how-to/sell" },
  { label: "Scale", href: "/how-to/scale" },
] as const;

const CHAPTERS = [
  {
    num: "Chapter 1",
    title: "How to Start",
    roman: "I",
    href: "/how-to/start",
    cover: "/img/books-covers/Frame_2147239727test-img-2.png",
  },
  {
    num: "Chapter 2",
    title: "Build",
    roman: "II",
    href: "/how-to/build",
    cover: "/img/books-covers/Frame_2147239728.png",
  },
  {
    num: "Chapter 3",
    title: "Selling Point",
    roman: "III",
    href: "/how-to/sell",
    cover: "/img/books-covers/Frame_2147239727test-img.png",
  },
  {
    num: "Chapter 4",
    title: "How to Scale",
    roman: "IV",
    href: "/how-to/scale",
    cover: "/img/books-covers/Frame_2147239727.png",
  },
] as const;

const ROADMAP_ROWS = [
  {
    h4: "A full accessibility roadmap tailored to each user",
    subcopy:
      "When setting up an accessible workspace, it's hard to know what's next. Spirit OS guides you through every step — from accessibility profile to first voice command — and kicks off agents for milestones as you build.",
    folder: "/img/homepage/folder-icon-1.png",
    learnHref: "/how-to/start",
    learnLabel: "Learn How to start",
    mockup: "roadmap",
  },
  {
    h4: "Build apps and run multimodal input pipelines",
    subcopy:
      "Develop custom React-based desktop apps on a unified browser-side window manager. Once live, webcam-based gesture, eye tracking, sign language, and voice input controllers stream user intents directly into the Zustand desktop store in real time.",
    folder: "/img/homepage/folder-icon-2.png",
    learnHref: "/how-to/build",
    learnLabel: "Learn Build",
    mockup: "build",
  },
  {
    h4: "Automate voice and Indic language support with agents",
    subcopy:
      "Spirit OS handles voice command normalization, Indic-language TTS/STT via Sarvam, conversational voice loops via Gemini Live, and 20+ configurable voice languages.",
    folder: "/img/homepage/folder-icon-3.svg",
    learnHref: "/how-to/sell",
    learnLabel: "Learn Selling point",
    mockup: "email",
  },
  {
    h4: "Scale with AI memory, secure vault, and emergency tools",
    subcopy:
      "Spirit OS agents run persistent memory via mem0ai, AES-encrypt credentials in the Vault, and dispatch SOS alerts to trusted contacts so users can scale safely.",
    folder: "/img/homepage/folder-icon-4.svg",
    learnHref: "/how-to/scale",
    learnLabel: "Learn How to scale",
    mockup: "analytics",
  },
] as const;

const TOGGLES = [
  {
    title: "You stay in control — caregiver modes, approval flows, and SOS override",
    icon: "shield",
  },
  {
    title:
      "Run multiple input modes simultaneously — voice, gesture, eye tracking, sign language",
    icon: "stack",
  },
  {
    title:
      "Customize Spirit OS with apps, skills, accessibility profiles, and schedules",
    icon: "puzzle",
  },
] as const;

const WORDSEARCH_WORDS = [
  "LOWVISION",
  "MOTORIMPAIRED",
  "ELDERLYUSER",
  "ALZHEIMERCARE",
  "CAREGIVERMODE",
  "VOICECONTROL",
  "EYETRACKING",
  "SIGNLANGUAGE",
  "INDICLANG",
  "OFFLINEAI",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ============================== HERO ============================== */}
        <LandingHero />

        {/* ============================== SOCIAL PROOF ============================== */}
        <div
          id="section-2-start"
          className="w-full bg-[#f5f5f2] flex flex-col items-center pt-[32px] pb-[72px] max-[700px]:pt-[24px] max-[700px]:pb-[56px]"
        >
          <div className="relative grid grid-cols-2 justify-items-center gap-[24px] min-[1001px]:flex min-[1001px]:items-center min-[1001px]:gap-[40px]">
            {[
              { name: "Low-vision users" },
              { name: "Motor-impaired users" },
              { name: "Elderly users" },
              { name: "Caregivers" },
            ].map((c) => (
              <Link
                key={c.name}
                to="/how-to/sell"
                aria-label={`Learn about Spirit OS for ${c.name}`}
                className="flex h-[96px] w-[182px] items-center justify-center opacity-70 transition-opacity hover:opacity-100"
              >
                <span
                  className="text-[18px] font-[460] tracking-[-0.01em] text-[rgba(38,35,35,0.8)] text-center"
                  style={{ fontFamily: "var(--font-departure-mono)" }}
                >
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
          <p className="m-0 mt-6 text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)] text-center max-w-[366px]">
            Built for over <span className="shimmer">1 billion users</span> who need accessible computing
          </p>
        </div>

        {/* ============================== SECTION 3: DASHBOARD ============================== */}
        <div className="relative w-full overflow-hidden bg-[#f5f5f2] pt-[20px] pb-[80px] min-[768px]:pb-[120px]">
          <div className="relative z-10 mx-auto max-w-[1100px] px-6 flex flex-col items-center">
            <Reveal>
              <h2 className="m-0 mx-auto text-center text-[28px] min-[767px]:text-[32px] min-[1000px]:text-[40px] font-normal leading-[115%] text-[#171717] max-w-[20ch]">
                Spirit OS is an AI-powered accessible desktop
                <br />
                designed to run entirely in the browser
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-[60px] w-full">
                <img
                  src="/img/homepage/spirit-screenshot.png"
                  alt="Spirit OS Desktop"
                  className="w-full rounded-[12px] overflow-hidden border border-[#dee2de]"
                  style={{
                    boxShadow:
                      "0 2px 3px rgba(0,0,0,0.06), inset 0 0 0.357px 1.5px rgba(255,255,255,0.35), inset 0 2px 0 #fff, 0 24px 60px rgba(0,0,0,0.10)",
                  }}
                />
              </div>
            </Reveal>

            {/* Features grid */}
            <div className="mt-[40px] min-[1000px]:mt-[80px] grid grid-cols-1 min-[1000px]:grid-cols-3 gap-[24px] min-[1000px]:gap-[40px] w-full min-[1100px]:w-[1080px]">
              {[
                {
                  text: "Multimodal input — Voice, gestures, eye tracking, sign language, and face recognition all work together in one workspace.",
                },
                {
                  text: "AI assistant with memory — Iris Engine cascades Gemini → Sarvam → OpenRouter → offline Spirit, with persistent memory via mem0ai.",
                },
                {
                  text: "15 built-in apps — File Explorer, Terminal, Notes, Reminders, Translator, Vault, Emergency, Known Book, and more.",
                },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 100}>
                  <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[#171717] max-w-[473px]">
                    {f.text}
                  </p>
                </Reveal>
              ))}
            </div>

            {/* Bottom CTA */}
            <Reveal delay={120}>
              <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 text-center min-[768px]:flex-row min-[768px]:gap-6 min-[768px]:text-left">
                <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] max-w-[430px] text-[rgba(38,35,35,0.7)] min-[768px]:max-w-[460px]">
                  Open Spirit OS in your browser and start with the next concrete task — no install required.
                </p>
                <CTAButton to="/app" variant="dark" className="shrink-0">
                  Launch Spirit OS
                </CTAButton>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ============================== SECTION 4: CHAPTER INTRO ============================== */}
        <div className="w-full bg-[#f5f5f2] pt-24 pb-10">
          <div className="max-w-[1080px] mx-auto px-5 min-[476px]:px-8 min-[768px]:px-6 flex flex-col items-center text-center">
            <Reveal>
              <h2 className="m-0 text-[28px] min-[767px]:text-[32px] min-[1000px]:text-[40px] font-normal leading-[115%] text-[#171717]">
                Learn how to make computing accessible
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] mt-4 w-full max-w-[360px] text-[rgba(38,35,35,0.7)]">
                Read the guide, then let Spirit OS turn each step into a real desktop workflow with voice, gestures, and AI.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-6">
                <CTAButton to="/app" variant="dark">
                  Put the guide to work
                </CTAButton>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ============================== SECTION 5: CHAPTER GRID ============================== */}
        <div className="relative w-full bg-[#f5f5f2]">
          {/* Backdrop image */}
          <div className="absolute inset-0 flex justify-center pointer-events-none">
            <picture>
              <source srcSet="/img/decor/behind-the-books.avif" type="image/avif" />
              <source srcSet="/img/decor/behind-the-books.webp" type="image/webp" />
              <img
                src="/img/decor/behind-the-books.webp"
                alt=""
                className="h-full w-auto object-cover opacity-40"
                aria-hidden="true"
              />
            </picture>
          </div>

          <div className="h-[100px]" />

          <div className="relative z-10 mx-auto max-w-[1100px] px-6 flex flex-col gap-[60px] items-center">
            <Reveal>
              <div className="flex flex-col md:flex-row gap-[80px] justify-center">
                {CHAPTERS.map((c) => (
                  <Link
                    key={c.href}
                    to={c.href}
                    className="group flex flex-col items-center text-center no-underline"
                  >
                    <div
                      className="relative w-[234px] h-[360px] overflow-hidden rounded-[6px] transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                      style={{
                        background: "#202020",
                        boxShadow:
                          "0 1px 1px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.23), 0 12px 30px rgba(0,0,0,0.18)",
                      }}
                    >
                      <img
                        src={c.cover}
                        alt={`${c.num} ${c.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1">
                      <span
                        className="text-[11px] font-[460] tracking-[0.15px] uppercase text-[rgba(38,35,35,0.5)]"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                      >
                        {c.num} · {c.roman}
                      </span>
                      <span className="text-[18px] font-[460] text-[rgba(38,35,35,0.9)]">
                        {c.title}
                      </span>
                      <span className="text-[12px] font-[460] text-[rgba(38,35,35,0.5)]">
                        by Spirit OS · 2026
                      </span>
                      <span className="mt-2 text-[14px] font-[460] text-[rgba(38,35,35,0.8)] flex items-center gap-1">
                        Read this chapter ({c.roman})
                        <svg
                           width="12"
                           height="12"
                           viewBox="0 0 12 12"
                           fill="none"
                           className="transition-transform duration-200 group-hover:translate-x-1"
                        >
                          <path
                            d="M2 6h8M7 3l3 3-3 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="h-[100px]" />

          <div className="h-[100px]" />
        </div>

        {/* ============================== SECTION 6: ROADMAP ============================== */}
        <div className="w-full bg-[#f5f5f2] py-[120px]">
          <div className="mx-auto max-w-[1100px] px-6">
            <Reveal>
              <h2 className="m-0 text-[28px] min-[767px]:text-[32px] min-[1000px]:text-[40px] font-normal leading-[115%] text-[#171717] max-w-[21ch]">
                Build a real accessible workspace with the help of specialized agents
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="m-0 mt-4 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.7)] max-w-[460px]">
                Choose the work you want done first, then let specialized agents move it forward with your approvals.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-6">
                <CTAButton to="/app" variant="dark">
                  Start your roadmap
                </CTAButton>
              </div>
            </Reveal>

            {/* Alternating rows */}
            <div className="mt-[80px] flex flex-col gap-[80px]">
              {ROADMAP_ROWS.map((row, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div
                    className={`flex flex-col gap-y-8 min-[1280px]:flex-row min-[1280px]:items-center min-[1280px]:gap-[80px] ${
                      i % 2 === 1 ? "min-[1280px]:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Text column */}
                    <div className="flex-1 max-w-[460px]">
                      <div className="flex items-start gap-3 mb-4">
                        <img
                          src={row.folder}
                          alt=""
                          className="w-[24px] h-[24px] mt-1 shrink-0"
                        />
                        <h4 className="m-0 text-[24px] font-normal leading-[115%] tracking-[0.15px] text-[rgba(38,35,35,0.8)]">
                          {row.h4}
                        </h4>
                      </div>
                      <p className="m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.7)]">
                        {row.subcopy}
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <Link
                          to={row.learnHref}
                          className="group inline-flex items-center gap-2 text-[15px] font-[460] tracking-[0.15px] text-[rgba(38,35,35,0.8)] no-underline hover:text-[rgba(38,35,35,1)] transition-colors"
                        >
                          {row.learnLabel}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          >
                            <path
                              d="M2 7h10M8 3l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                        <Link
                          to="/app"
                          className="text-[15px] font-[460] tracking-[0.15px] text-[rgba(38,35,35,0.8)] no-underline hover:text-[rgba(38,35,35,1)] transition-colors"
                        >
                          Launch Spirit OS →
                        </Link>
                      </div>
                    </div>

                    {/* Mockup column */}
                    <div className="flex-1 min-[1280px]:max-w-[560px]">
                      <RoadmapMockup type={row.mockup} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ============================== SECTION 7: BLUE / TOOLS ============================== */}
        <section className="relative w-full flex flex-col bg-[#1a6fd1] text-white overflow-hidden pt-[100px] pb-[160px] min-[767px]:pb-[100px] min-[1000px]:pb-[220px]">
          {/* Pixel grain overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-[1100px] px-6 flex flex-col items-center">
            <Reveal>
              <h2 className="m-0 mx-auto text-center text-[28px] min-[768px]:text-[32px] min-[1000px]:text-[40px] font-normal leading-[115%] text-white max-w-[20ch]">
                All the tools and systems an accessible OS needs
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="m-0 mt-4 mx-auto text-center text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(255,255,255,0.8)] max-w-[460px]">
                Give users the input modalities, AI assistance, and safety tools they need to keep computing independently.
              </p>
            </Reveal>

            <div className="mt-[60px] w-full grid grid-cols-1 min-[1000px]:grid-cols-[1fr_1.5fr] gap-[40px] items-center">
              {/* Toggle list */}
              <div className="flex flex-col gap-[16px]">
                {TOGGLES.map((t, i) => (
                  <Reveal key={i} delay={i * 100}>
                    <div className="flex items-start gap-4 min-w-0 text-left p-2 min-[1000px]:p-0">
                      <span
                        className="shrink-0 mt-1 w-[20px] h-[20px] rounded-full flex items-center justify-center"
                        style={{
                          background:
                            i === 1 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.15)",
                        }}
                      >
                        <span
                          className="block w-[6px] h-[6px] rounded-full"
                          style={{
                            background:
                              i === 1 ? "#1a6fd1" : "rgba(255,255,255,0.7)",
                          }}
                        />
                      </span>
                      <span
                        className="text-[16px] font-[400] leading-[140%]"
                        style={{
                          color:
                            i === 1 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {t.title}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Central panel mockup */}
              <Reveal delay={200}>
                <div
                  className="relative w-full rounded-[16px] p-[24px] min-[1000px]:p-[32px]"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {/* Header chips */}
                  <div className="flex flex-wrap items-center gap-[8px] mb-[24px]">
                    {[
                      "Iris Assistant",
                      "Voice Agent",
                      "Add trigger",
                      "Add subagent",
                      "Sarvam Subagent",
                      "Gemini Subagent",
                      "Spirit Fallback",
                      "+12",
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center h-[28px] px-[10px] rounded-[14px] text-[12px] font-[460] tracking-[0.12px]"
                        style={{
                          background:
                            chip === "Iris Assistant"
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.10)",
                          color: chip === "Iris Assistant" ? "#1a6fd1" : "rgba(255,255,255,0.9)",
                          border: "1px solid rgba(255,255,255,0.18)",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* Customize Agent Template panel */}
                  <div
                    className="rounded-[12px] p-[20px]"
                    style={{
                      background: "rgba(0,0,0,0.18)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <p className="m-0 mb-[16px] text-[14px] font-[460] tracking-[0.14px] text-[rgba(255,255,255,0.95)]">
                      Customize Agent Template
                    </p>
                    <div className="flex flex-col gap-[14px]">
                      <div>
                        <label className="block text-[11px] font-[460] tracking-[0.11px] text-[rgba(255,255,255,0.5)] mb-[6px]">
                          Name
                        </label>
                        <div
                          className="h-[36px] px-[12px] flex items-center rounded-[6px] text-[14px] text-[rgba(255,255,255,0.95)]"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          Iris Assistant
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-[460] tracking-[0.11px] text-[rgba(255,255,255,0.5)] mb-[6px]">
                          Custom Instructions
                        </label>
                        <div
                          className="h-[72px] px-[12px] py-[10px] text-[14px] text-[rgba(255,255,255,0.5)] rounded-[6px]"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          Add custom instructions on how the assistant should behave across voice, gesture, and sign input..
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-[8px] mt-[8px]">
                        {["Add trigger", "Add subagent", "+12"].map((b) => (
                          <button
                            key={b}
                            type="button"
                            className="inline-flex items-center h-[32px] px-[12px] rounded-[6px] text-[12px] font-[460] tracking-[0.12px] text-[rgba(255,255,255,0.9)]"
                            style={{
                              background: "rgba(255,255,255,0.10)",
                              border: "1px solid rgba(255,255,255,0.18)",
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============================== SECTION 8: WORDSEARCH / USE CASES ============================== */}
        <div className="w-full bg-[#f5f5f2] py-[120px]">
          <div className="mx-auto max-w-[1100px] px-6 flex flex-col items-center">
            <Reveal>
              <h3 className="m-0 text-[32px] font-normal leading-[115%] tracking-[0.32px] text-center text-[#171717]">
                Build for every kind of user
              </h3>
            </Reveal>
            <Reveal delay={100}>
              <p className="m-0 mt-3 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.7)] max-w-[460px] text-center">
                From low-vision users to motor-impaired users, elderly users, and caregivers — Spirit OS helps you turn accessibility needs into working desktop workflows.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-[60px] w-full flex flex-col items-center gap-[16px]">
                {WORDSEARCH_WORDS.map((word, i) => (
                  <WordsearchRow key={word} word={word} index={i} />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/* ============================================================
   Word-search row — highlights one accessibility use-case word
   ============================================================ */
function WordsearchRow({ word, index }: { word: string; index: number }) {
  // Generate filler letters before and after the highlighted word
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const padBefore = 4 + (index % 3);
  const padAfter = 3 + ((index + 1) % 4);
  const before = Array.from({ length: padBefore }, () => chars[Math.floor(Math.random() * 26)]).join("");
  const after = Array.from({ length: padAfter }, () => chars[Math.floor(Math.random() * 26)]).join("");

  return (
    <div
      className="flex items-center gap-[8px] sm:gap-[12px] flex-wrap justify-center"
      style={{ fontFamily: "var(--font-departure-mono), 'Departure Mono', monospace" }}
    >
      <span className="text-[14px] sm:text-[16px] text-[rgba(38,35,35,0.3)] tracking-[0.1em]">
        {before}
      </span>
      <span className="relative inline-flex items-center">
        <span
          className="absolute inset-0 border-b-[1.5px] border-[rgba(38,35,35,0.7)]"
          aria-hidden="true"
        />
        <span className="wordsearch-letter lvl1 text-[16px] sm:text-[18px] text-[rgba(38,35,35,0.9)] tracking-[0.1em]">
          {word}
        </span>
      </span>
      <span className="text-[14px] sm:text-[16px] text-[rgba(38,35,35,0.3)] tracking-[0.1em]">
        {after}
      </span>
    </div>
  );
}

/* ============================================================
   Roadmap mockup — switches on `type` to render a different visual
   ============================================================ */
function RoadmapMockup({ type }: { type: "roadmap" | "build" | "email" | "analytics" }) {
  const shellClass =
    "w-full rounded-[12px] p-[16px] sm:p-[20px] bg-[#fbfbf8] border border-[#dee2de] shadow-[0_2px_3px_rgba(0,0,0,0.06),inset_0_0_0.357px_1.5px_rgba(255,255,255,0.35),inset_0_2px_0_#fff]";

  if (type === "roadmap") {
    return (
      <div className={shellClass}>
        <div className="flex flex-col gap-[8px]">
          {[
            { stage: "Profile setup", cur: 1, tot: 1 },
            { stage: "Input config", cur: 0, tot: 3 },
            { stage: "First command", cur: 0, tot: 4 },
          ].map((s) => (
            <div key={s.stage} className="flex items-center justify-between">
              <span className="text-[13px] text-[rgba(38,35,35,0.8)]">{s.stage}</span>
              <span className="text-[12px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {s.cur}/{s.tot}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-[16px] grid grid-cols-2 gap-[8px]">
          {[
            { name: "Pick accessibility profile", type: "User task" },
            { name: "Configure voice", type: "User task" },
            { name: "Calibrate eye tracking", type: "Agent task" },
            { name: "Train sign language", type: "Agent requires approval" },
            { name: "Set up gestures", type: "Agent task" },
            { name: "Test voice command", type: "User task" },
            { name: "Lock screen face ID", type: "Agent task" },
            { name: "Enable SOS panel", type: "Agent requires approval" },
          ].map((t) => (
            <div
              key={t.name}
              className="p-[10px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de]"
            >
              <div className="text-[12px] text-[rgba(38,35,35,0.85)] leading-tight">{t.name}</div>
              <div className="text-[10px] mt-[2px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {t.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "build") {
    return (
      <div className={shellClass}>
        <div className="flex items-center gap-[8px] mb-[12px]">
          <span className="w-[8px] h-[8px] rounded-full bg-[#34a853]" />
          <span className="text-[13px] text-[rgba(38,35,35,0.8)]">App Pipeline</span>
        </div>
        <div className="flex flex-col gap-[6px]">
          {["Landing Page", "Voice Controller", "Gesture Loop", "Eye Tracker"].map((t, i) => (
            <div
              key={i}
              className="p-[10px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de] text-[12px] text-[rgba(38,35,35,0.85)]"
            >
              {t}
            </div>
          ))}
          <div className="p-[10px] rounded-[6px] border border-dashed border-[#dee2de] text-[12px] text-[rgba(38,35,35,0.5)]">
            + Create new task for Spirit OS
          </div>
        </div>
      </div>
    );
  }

  if (type === "email") {
    return (
      <div className={shellClass}>
        <div className="p-[12px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de] mb-[12px]">
          <div className="text-[11px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            User said: &lsquo;open notes app&rsquo;
          </div>
          <div className="text-[11px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            Recognized: open notes app
          </div>
          <div className="text-[11px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            Normalized (Indic): नोट्स ऐप खोलो
          </div>
          <div className="text-[12px] font-[460] text-[rgba(38,35,35,0.9)] mt-[6px]">
            Action dispatched: open_app(notes)
          </div>
          <p className="m-0 mt-[8px] text-[12px] leading-[150%] text-[rgba(38,35,35,0.7)]">
            Voice agent picked up the command, normalized it for the Indic stack, and dispatched the open_app tool call to the desktop — Notes opened in a new window.
          </p>
        </div>
        <div className="p-[12px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de]">
          <div className="text-[12px] font-[460] text-[rgba(38,35,35,0.9)] mb-[6px]">
            Voice Pipeline Report
          </div>
          <div className="grid grid-cols-2 gap-[6px] text-[11px]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
            <div className="text-[rgba(38,35,35,0.7)]">STT accuracy 96%</div>
            <div className="text-[rgba(38,35,35,0.7)]">Indic languages 20+</div>
            <div className="text-[rgba(38,35,35,0.7)]">TTS latency 280ms</div>
            <div className="text-[rgba(38,35,35,0.7)]">Active engines 4</div>
            <div className="text-[rgba(38,35,35,0.5)]">Web Speech API</div>
            <div className="text-[rgba(38,35,35,0.5)]">Sarvam TTS</div>
            <div className="text-[rgba(38,35,35,0.5)]">Gemini Live</div>
            <div className="text-[rgba(38,35,35,0.5)]">Spirit fallback</div>
          </div>
        </div>
      </div>
    );
  }

  // analytics
  return (
    <div className={shellClass}>
      <div className="grid grid-cols-2 gap-[8px] mb-[12px]">
        {[
          { label: "Active users", val: "9,262", delta: "+8%" },
          { label: "Reminders set", val: "44,264", delta: "+37%" },
          { label: "SOS dispatched", val: "211", delta: "+34%" },
          { label: "Memories stored", val: "2,843", delta: "" },
        ].map((m) => (
          <div key={m.label} className="p-[10px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de]">
            <div className="text-[10px] text-[rgba(38,35,35,0.5)]">{m.label}</div>
            <div className="text-[16px] font-[460] text-[rgba(38,35,35,0.9)]">{m.val}</div>
            <div className="text-[10px] text-[#34a853]">{m.delta}</div>
          </div>
        ))}
      </div>
      <div className="p-[12px] rounded-[6px] bg-[#f5f5f2] border border-[#dee2de]">
        <div className="text-[11px] text-[rgba(38,35,35,0.5)] mb-[6px]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
          Time Series
        </div>
        {/* Simple bar chart */}
        <div className="flex items-end gap-[6px] h-[60px]">
          {[40, 80, 120, 100, 160, 200, 180, 240, 220, 280, 320, 300].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[2px] bg-[#1a6fd1]"
              style={{ height: `${(h / 400) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-[6px] text-[10px] text-[rgba(38,35,35,0.5)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
        </div>
        <div className="mt-[10px] text-[11px] text-[rgba(38,35,35,0.7)]">
          Live: <span className="font-[460] text-[rgba(38,35,35,0.9)]">2,843</span> reminders fired this week
        </div>
      </div>
    </div>
  );
}

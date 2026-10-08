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
} from "../components/how-to/prose";


/* ------------------------------------------------------------------ */
/*  Local helpers — Launch Spirit OS dark CTA                            */
/* ------------------------------------------------------------------ */

function LaunchSpiritOSCta() {
  return (
    <div className="mt-[40px]">
      <a
        href="/app"
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
/*  DIAGRAM 1 — SCALING LOOP (5-step cycle)                              */
/* ------------------------------------------------------------------ */

function ScalingLoopDiagram() {
  const steps = [
    { name: "Profile", desc: "Capture the user's accessibility settings, voice model, gesture calibration, and sign-language classifier." },
    { name: "Calibrate", desc: "Tune the modalities to the user's range of motion, gaze behavior, and sign vocabulary." },
    { name: "Use", desc: "Run Spirit OS in real tasks — files, reminders, calls, Vault, browser." },
    { name: "Learn", desc: "Collect local, opt-in analytics on which modalities succeed and which fail." },
    { name: "Refine", desc: "Adjust the profile, retrain the classifier, tune dwell timing, prune dead commands." },
  ];
  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Scaling loop</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          Each user&apos;s profile is portable. Add a user, calibrate, measure,
          refine, then add another.
        </span>
      </div>
      <ol className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[12px]">
        {steps.map((s, i) => (
          <li
            key={s.name}
            className="relative rounded-[12px] border border-[#E8E7E6] bg-[rgba(242,242,237,0.40)] px-[14px] py-[14px] flex flex-col gap-[6px]"
          >
            <div className="flex items-center gap-[8px]">
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] bg-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[#fbfbf8]">
                {i + 1}
              </span>
              <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                {s.name}
              </span>
            </div>
            <p className="m-0 text-[12px] font-[460] leading-[150%] tracking-[0.12px] text-[rgba(38,35,35,0.65)]">
              {s.desc}
            </p>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden lg:block absolute top-1/2 -right-[10px] -translate-y-1/2 font-[family-name:var(--font-ibm-plex-mono)] text-[14px] text-[rgba(38,35,35,0.4)]"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="flex items-center justify-center gap-[8px]">
        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.5)]">
          ↻ refine feeds the next user&apos;s profile
        </span>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGRAM 2 — UNIT ECONOMICS (cost breakdown card)                    */
/* ------------------------------------------------------------------ */

function UnitEconomicsDiagram() {
  const tiers = [
    {
      name: "Server hosting",
      cost: "small VPS",
      desc: "Express backend + Prisma/SQLite. ~50 concurrent users on a $5/month VPS; scale vertically from there.",
      emphasized: false,
    },
    {
      name: "AI APIs (optional)",
      cost: "pay per call",
      desc: "Gemini, Sarvam, OpenRouter, Groq. Only if cloud AI is enabled. The cascade falls back gracefully between providers.",
      emphasized: true,
    },
    {
      name: "Offline fallback",
      cost: "$0",
      desc: "The Spirit NLP engine handles deterministic commands with no API keys. A self-hosted deployment can run at zero ongoing cost.",
      emphasized: false,
    },
  ];
  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Unit economics</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          Spirit OS is free for personal use. Deployments pay for hosting and
          optional AI — never for the OS itself.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-[12px] border px-[18px] py-[16px] flex flex-col gap-[8px] ${
              t.emphasized
                ? "border-[rgba(26,111,209,0.30)] bg-[#F7FBFF]"
                : "border-[#E8E7E6] bg-[rgba(242,242,237,0.40)]"
            }`}
          >
            <div className="flex items-center justify-between gap-[8px] flex-wrap">
              <span
                className={`text-[11px] font-[family-name:var(--font-ibm-plex-mono)] font-medium leading-[140%] tracking-[0.11px] uppercase ${
                  t.emphasized ? "text-[#1a6fd1]" : "text-[rgba(38,35,35,0.5)]"
                }`}
              >
                {t.name}
              </span>
              <span
                className={`font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[140%] ${
                  t.emphasized
                    ? "text-[#1a6fd1]"
                    : "text-[rgba(38,35,35,0.7)]"
                }`}
              >
                {t.cost}
              </span>
            </div>
            <p
              className={`m-0 text-[13px] font-[460] leading-[150%] tracking-[0.13px] ${
                t.emphasized
                  ? "text-[rgba(38,35,35,0.85)]"
                  : "text-[rgba(38,35,35,0.65)]"
              }`}
            >
              {t.desc}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-[10px] border border-[#E8E7E6] bg-[rgba(242,242,237,0.30)] px-[14px] py-[10px] flex flex-col gap-[4px]">
        <span className="text-[11px] font-[family-name:var(--font-ibm-plex-mono)] font-medium uppercase tracking-[0.11px] text-[rgba(38,35,35,0.5)]">
          Personal use
        </span>
        <span className="text-[13px] font-[460] leading-[150%] tracking-[0.13px] text-[rgba(38,35,35,0.75)]">
          Free. MIT-licensed, open source, works fully offline without any API
          keys. The only cost is what you choose to add.
        </span>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  DIAGRAM 3 — EXPANSION PATHS (3 contrast cards)                      */
/* ------------------------------------------------------------------ */

function ExpansionPathsDiagram() {
  const paths = [
    {
      pill: "Vertical",
      title: "Deeper for one user type",
      body: "A specialized Alzheimer\u2019s care facility deployment — custom reminders, integrated medical record import, caregiver dashboards. Requires domain expertise.",
      emphasized: false,
    },
    {
      pill: "Horizontal",
      title: "New user types",
      body: "Autism-friendly profiles, dyslexia-friendly reading modes, motor-recovery therapy profiles for stroke patients. Requires user research.",
      emphasized: true,
    },
    {
      pill: "Platform",
      title: "Open the marketplace",
      body: "Third-party developers build Spirit OS apps — AAC communicator, visual schedule, sensory regulation timer. Requires developer relations.",
      emphasized: false,
    },
  ];
  return (
    <figure className="mt-[40px] flex flex-col gap-[16px] m-0">
      <div className="flex items-center gap-[10px] flex-wrap">
        <DiagramPill>Expansion paths</DiagramPill>
        <span className="text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)]">
          Three ways to raise the ceiling — each with different scaling
          challenges.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
        {paths.map((p) => (
          <div
            key={p.pill}
            className={`rounded-[12px] border px-[18px] py-[16px] flex flex-col gap-[10px] ${
              p.emphasized
                ? "border-[rgba(26,111,209,0.30)] bg-[#F7FBFF]"
                : "border-[#E8E7E6] bg-[rgba(242,242,237,0.40)]"
            }`}
          >
            <DiagramPill>{p.pill}</DiagramPill>
            <p
              className={`m-0 text-[14px] font-[530] leading-[140%] tracking-[0.14px] ${
                p.emphasized
                  ? "text-[rgba(38,35,35,0.95)]"
                  : "text-[rgba(38,35,35,0.85)]"
              }`}
            >
              {p.title}
            </p>
            <p
              className={`m-0 text-[13px] font-[460] leading-[150%] tracking-[0.13px] ${
                p.emphasized
                  ? "text-[rgba(38,35,35,0.80)]"
                  : "text-[rgba(38,35,35,0.65)]"
              }`}
            >
              {p.body}
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

export default function HowToScalePage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[91px] min-[1000px]:pt-[120px] pb-[120px]">
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] min-[1000px]:flex min-[1000px]:gap-[60px]">
          {/* Sidebar */}
          <aside className="hidden min-[1000px]:block w-[240px] shrink-0">
            <div className="sticky top-[120px]">
              <ChapterSidebar active="scale" />
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
                Chapter IV
              </div>
              <h1
                className="m-0 text-[32px] md:text-[40px] font-normal leading-[115%] text-[rgba(38,35,35,0.95)] mt-[24px]"
                style={{ fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif" }}
              >
                How to scale Spirit OS
              </h1>
              <div className="mt-[32px]">
                <BodyPara>
                  Once Spirit OS is running for one user, how do you extend it to
                  a school, a clinic, an eldercare facility, or millions of
                  users — without losing what makes it accessible?
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Scaling Spirit OS is not a question of more servers. It is a
                  question of preserving the per-user care that makes the OS
                  work in the first place. A larger deployment that loses the
                  accessibility loop is a failure, not a success.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  This chapter covers the scaling loop, local-first analytics,
                  customer support and SOS, unit economics, expansion paths, and
                  the roadmap ahead.
                </BodyPara>
              </div>
            </div>

            {/* Lead callout */}
            <SpiritFeatureCallout
              label="Portable user profiles"
              description="Each user's accessibility profile — settings, voice model, gesture calibration, sign-language classifier, and persistent memory via mem0ai — is portable across sessions and devices. A user can sit down at any Spirit OS instance and have their workspace follow them."
            />

            {/* ===================== SECTION 1 — Start with the scaling loop ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="start-with-the-scaling-loop">Start with the scaling loop</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Scaling Spirit OS is a loop, not a launch. You add a user,
                  configure their profile, measure what works, refine, and then
                  add another user. Each turn of the loop makes the next user
                  easier.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Each user&apos;s profile is <Strong>portable</Strong>: their
                  accessibility settings, their voice model, their gesture
                  calibration, their sign-language classifier. The profile can
                  travel with the user across machines, across classrooms, or
                  across a multi-floor eldercare facility. The user does not
                  have to retrain Spirit OS every time they sit down somewhere
                  new.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Persistent memory via mem0ai means the assistant also travels.
                  The user&apos;s name, their preferences, their recurring
                  questions, the names of their family — all of it persists
                  across sessions and devices. The assistant does not introduce
                  itself like a stranger every morning.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The loop is: <Strong>Profile</Strong> →{" "}
                  <Strong>Calibrate</Strong> → <Strong>Use</Strong> →{" "}
                  <Strong>Learn</Strong> → <Strong>Refine</Strong>. Then add the
                  next user, and the next, and the next.
                </BodyPara>
              </div>

              <ScalingLoopDiagram />

              <BodyPara className="mt-[24px]">
                Early on, you can run this loop manually — sit with one user,
                watch them use the OS, adjust their profile in real time. You
                should do some of this. It gives you a feel for what users
                actually need that no dashboard can replace.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                But manual observation breaks down past a few users. You need
                systems that capture signal as the deployment grows. Not just
                servers and databases, but the analytics, support, and feedback
                loops that keep the per-user care intact at scale.
              </BodyPara>

              <SpiritFeatureCallout
                label="Portable user profiles via mem0ai"
                description="Accessibility settings, voice model, gesture calibration, sign-language classifier, and persistent memory all travel with the user. A student can sit down at any workstation in a computer lab and have their workspace — and the assistant's memory of them — follow."
              />
            </div>

            {/* ===================== SECTION 2 — Add user analytics and feedback ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="add-user-analytics-and-feedback">Add user analytics and feedback</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS does not phone home. All analytics are{" "}
                  <Strong>local and opt-in</Strong>. The user — or their
                  caregiver — decides whether to enable them. There is no
                  telemetry server in the cloud counting keystrokes.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The Settings app shows usage stats: which input modalities the
                  user actually uses (voice, gesture, eye tracking, sign,
                  keyboard), which apps they open most, which voice commands
                  succeed versus fail. This is the data the user — and their
                  caregiver — needs to refine the profile.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Caregivers can review these stats in Caregiver Mode. If an
                  elderly user&apos;s eye-tracking clicks have a 30% success
                  rate, the caregiver can recalibrate dwell timing or switch
                  them to a voice-first profile. If a user keeps trying a voice
                  command that fails, the caregiver can map that phrasing to
                  the canonical command.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For multi-user deployments — schools, clinics, eldercare
                  facilities — aggregate anonymized analytics can be enabled at
                  the facility level. The deployment operator sees how many
                  users are active, which apps are most used, and where users
                  are struggling — without seeing any individual user&apos;s
                  personal data.
                </BodyPara>
              </div>

              <ListLabel>What analytics captures — and what it does not:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>Captures:</Strong> which modalities succeed, which
                    apps are used, which voice commands fail.
                  </>,
                  <>
                    <Strong>Does not capture:</Strong> file contents, Vault
                    data, voice audio, sign-language video, personal
                    identifiers.
                  </>,
                  <>
                    <Strong>Caregiver view:</Strong> per-user stats to spot
                    where the user is struggling and adjust the profile.
                  </>,
                  <>
                    <Strong>Facility view:</Strong> aggregate, anonymized stats
                    for deployment health — no individual user data.
                  </>,
                ]}
              />

              <SpiritFeatureCallout
                label="Local-first analytics"
                description="Spirit OS does not phone home. All analytics are local and opt-in. The user — or their caregiver — decides whether to enable them. There is no telemetry server counting keystrokes in the cloud."
              />
            </div>

            {/* ===================== SECTION 3 — Add customer support and SOS ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="add-customer-support-and-sos">Add customer support and SOS</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Accessibility is a support problem before it is a software
                  problem. Users will get stuck. Caregivers will need help. And
                  sometimes, the user will need to reach a human in a hurry.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>SOS Panel</Strong> dispatches to a configurable
                  list of emergency contacts. For personal use, that is family.
                  For eldercare facilities, that is the on-call nurse. For
                  schools, that is the IT office. The dispatch list is part of
                  the user profile — the same SOS button calls the right person
                  in every context.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>Known Book</Strong> manages trusted contacts with
                  photos for visual recognition. For an elderly user, the
                  difference between &ldquo;daughter&rdquo; and &ldquo;unknown
                  caller&rdquo; is the difference between answering and not
                  answering. The Known Book pairs every contact with a face.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For multi-user deployments, the SOS dispatch can be configured
                  to also alert facility staff via the WebSocket event bus. A
                  nurse&apos;s station sees every SOS dispatch in real time,
                  with the user&apos;s name and room. A school IT office sees
                  every workstation SOS at once.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The <Strong>Reminder System</Strong> supports recurring
                  schedules — daily medication, weekly check-ins, monthly
                  appointments. Reminders can be voice-set in any Indic
                  language, and the assistant confirms them in the same
                  language. A missed reminder can also trigger a caregiver
                  notification, so a caregiver knows when an elderly user
                  missed their morning medication.
                </BodyPara>
              </div>

              <SpiritFeatureCallout
                label="SOS dispatch + event bus"
                description="The SOS Panel dispatches to a configurable contact list — family for personal use, on-call nurse for eldercare, IT office for schools. For multi-user deployments, the WebSocket event bus alerts facility staff in real time, with the user's name and location."
              />
            </div>

            {/* ===================== SECTION 4 — Understand unit economics ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="understand-unit-economics">Understand unit economics</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is open source under the Apache-2.0 license. For personal
                  use, it is free. The only cost is the optional AI API keys —
                  Gemini, Sarvam, OpenRouter, Groq — and Spirit OS works fully
                  offline without any of them.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  For deployments, the cost has three components: server
                  hosting, optional AI API calls, and the offline fallback. The
                  first two scale with usage; the third is always zero.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  A small VPS can host the Express backend with Prisma and
                  SQLite for roughly 50 concurrent users. That is a $5/month
                  server. Past that, you scale vertically (bigger VPS) or
                  horizontally (multiple VPS instances behind a load balancer).
                  Spirit OS is not a Kubernetes deployment by default — you do
                  not need a platform team.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  AI API costs depend on which providers are enabled and how
                  heavily they are used. The cascade falls back gracefully —
                  Gemini first, then Sarvam, then OpenRouter or Groq, then the
                  offline Spirit engine — so a deployment can disable the
                  priciest providers without breaking the user experience.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  A self-hosted deployment can run on the offline Spirit engine
                  alone — zero ongoing cost, no API keys, no cloud bills. For a
                  school in a low-bandwidth area, or a clinic with strict data
                  residency requirements, that is the right answer.
                </BodyPara>
              </div>

              <UnitEconomicsDiagram />

              <SpiritFeatureCallout
                label="Self-hosted or cloud"
                description="Spirit OS runs on a $5/month VPS for ~50 concurrent users, or entirely offline with no API keys. A school in a low-bandwidth area or a clinic with strict data residency requirements can self-host at zero ongoing cost."
              />
            </div>

            {/* ===================== SECTION 5 — Expand the business ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="expand-the-business">Expand the business</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Once Spirit OS works for one user type, the next question is
                  how to expand the ceiling. There are three broad paths.
                </BodyPara>
              </div>

              <ExpansionPathsDiagram />

              <BodyPara className="mt-[24px]">
                <Strong>Vertical</Strong> means going deeper for one user type.
                A specialized Alzheimer&apos;s care facility deployment might
                add custom reminders integrated with the facility&apos;s
                medication schedule, medical record import from the
                facility&apos;s EHR, and caregiver dashboards that surface
                per-resident analytics. Vertical requires domain expertise —
                you need to understand Alzheimer&apos;s care, not just software.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                <Strong>Horizontal</Strong> means adding new user types.
                Autism-friendly profiles, dyslexia-friendly reading modes,
                motor-recovery therapy profiles for stroke patients — each is a
                new accessibility profile plus tuned defaults. Horizontal
                requires user research. You cannot ship an autism-friendly
                profile without talking to autistic users and their caregivers.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                <Strong>Platform</Strong> means opening the app marketplace.
                Third-party developers build Spirit OS apps — an AAC
                communicator, a visual schedule, a sensory regulation timer, a
                therapy compliance tracker — using the extensible app system.
                Platform requires developer relations: documentation, example
                apps, a review process, and a distribution channel.
              </BodyPara>
              <BodyPara className="mt-[20px]">
                Each path has different scaling challenges. Vertical requires
                domain expertise. Horizontal requires user research. Platform
                requires developer relations. Pick the path that matches what
                your team is good at and what your users are asking for.
              </BodyPara>

              <ListLabel>Before expanding, ask:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>Where is demand already showing up?</Strong> Look at
                    inbound requests, deployment conversations, and caregiver
                    feedback. Real demand beats speculative demand.
                  </>,
                  <>
                    <Strong>Does this improve the per-user care loop?</Strong>{" "}
                    Expansion should make users better served, not just more
                    numerous.
                  </>,
                  <>
                    <Strong>Will it strengthen the core OS or distract from
                    it?</Strong> The best expansions make the core Spirit OS
                    better. The worst ones split engineering focus and slow down
                    what is already working.
                  </>,
                  <>
                    <Strong>Can we test demand before building the full
                    thing?</Strong> Talk to a facility. Get a verbal commit or
                    a pilot agreement. If nobody will say yes before you build,
                    the demand may not be there.
                  </>,
                ]}
              />

              <SpiritFeatureCallout
                label="Spirit OS feature"
                description="The extensible app system makes the Platform path concrete. A third-party developer can build a Spirit OS app — AAC communicator, visual schedule, sensory regulation timer — by dropping a file in client/src/apps/ and registering it. The new app inherits every accessibility profile and the Iris assistant for free."
              />
            </div>

            {/* ===================== SECTION 6 — What comes next ===================== */}
            <div className="mt-[80px]">
              <SectionH2 id="what-comes-next">What comes next</SectionH2>
              <div className="mt-[24px]">
                <BodyPara>
                  Spirit OS is a long-term project. Accessibility is a moving
                  target — what is sufficient today will be table stakes
                  tomorrow. The architecture is built to evolve.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  The roadmap includes a mobile companion app for remote
                  caregiver check-ins, a public app marketplace, integration
                  with external AAC devices via Web Bluetooth and WebUSB, more
                  Indic languages, more accessibility profiles, and on-device
                  LLM via WebGPU so the assistant can run without any network
                  at all.
                </BodyPara>
                <BodyPara className="mt-[20px]">
                  Each of these is a chapter, not a milestone. Spirit OS will
                  never be &ldquo;done&rdquo; — and that is the point. The OS
                  that ships today is the worst Spirit OS will ever be. The OS
                  that ships next year will be better. The OS that ships in five
                  years will be unrecognizable, in the best way.
                </BodyPara>
              </div>

              <ListLabel>On the roadmap:</ListLabel>
              <BulletList
                items={[
                  <>
                    <Strong>Mobile companion app</Strong> — remote caregiver
                    check-ins from anywhere.
                  </>,
                  <>
                    <Strong>Public app marketplace</Strong> — third-party
                    developers distribute Spirit OS apps.
                  </>,
                  <>
                    <Strong>External AAC device integration</Strong> — Web
                    Bluetooth and WebUSB for switch-control hardware.
                  </>,
                  <>
                    <Strong>More Indic languages</Strong> — extending Sarvam
                    coverage and the indianVoiceNormalize library.
                  </>,
                  <>
                    <Strong>More accessibility profiles</Strong> —
                    autism-friendly, dyslexia-friendly, motor-recovery.
                  </>,
                  <>
                    <Strong>On-device LLM via WebGPU</Strong> — the Iris
                    assistant runs without any network at all.
                  </>,
                ]}
              />

              <BodyPara className="mt-[24px]">
                The OS gets better when the loop gets better. Keep the loop
                moving.
              </BodyPara>

              <LaunchSpiritOSCta />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

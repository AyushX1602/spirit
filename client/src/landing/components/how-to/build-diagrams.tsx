import { DiagramPill } from "../../components/how-to/diagram-pill";

/**
 * All 6 unique labeled diagrams for the Build chapter.
 * Each diagram uses the shared DIAGRAM_LABEL pill + tagline + bespoke visual.
 *
 * Verbatim labels and taglines from recon/spec-03-build.md §3.
 *
 * Server components (no "use client").
 */

/* ------------------------------------------------------------------ */
/*  Shared diagram shell — pill + tagline + body                       */
/* ------------------------------------------------------------------ */

function DiagramShell({
  label,
  tagline,
  subTagline,
  children,
}: {
  label: string;
  tagline: string;
  subTagline?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[40px] rounded-[16px] border border-[#E8E7E6] bg-[#FBFBF8] px-[24px] py-[24px] flex flex-col gap-[20px]">
      <div>
        <DiagramPill>{label}</DiagramPill>
        <p className="m-0 mt-[10px] text-[18px] font-[530] leading-[22px] text-[rgba(38,35,35,0.95)]">
          {tagline}
        </p>
        {subTagline && (
          <p className="m-0 mt-[8px] text-[13px] font-[460] leading-[18px] tracking-[0.13px] text-[rgba(38,35,35,0.65)] max-w-[480px]">
            {subTagline}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 1 — VERSION CONTROL (Section 2: Create a repository)       */
/* ------------------------------------------------------------------ */

const BRANCH_PILLS = [
  "feature/refactor",
  "feature/auth",
  "feature/billing",
];

export function VersionControlDiagram() {
  return (
    <DiagramShell
      label="Version control"
      tagline="A repository is the source of truth for your product."
      subTagline="Every meaningful change moves through a branch, a review, and a protected main branch before production sees it."
    >
      <div className="flex flex-col gap-[20px]">
        {/* Branch diagram */}
        <div className="relative flex items-center gap-[16px] flex-wrap">
          {/* main line on the left */}
          <div className="flex flex-col items-center gap-[4px]">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.5)]">
              main
            </span>
            <div className="w-[2px] h-[120px] bg-[rgba(38,35,35,0.5)] rounded-full" />
          </div>

          {/* Feature branches (3 horizontal rows) */}
          <div className="flex flex-col gap-[20px] flex-1 min-w-0">
            {BRANCH_PILLS.map((branch, i) => (
              <div key={branch} className="flex items-center gap-[10px]">
                <div className="h-[2px] w-[40px] bg-[rgba(38,35,35,0.35)]" />
                <span className="inline-flex items-center rounded-[100px] border border-[#DADAD5] bg-[#EFEFEB] px-[8px] py-[3px] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.72)]">
                  {branch}
                </span>
                <span className="text-[11px] font-[460] leading-[14px] text-[rgba(38,35,35,0.5)]">
                  → PR → review → merge
                </span>
                <span
                  className="ml-auto inline-flex items-center rounded-[100px] border border-[#D7E8FF] bg-[#F7FBFF] px-[8px] py-[3px] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[#007EC7]"
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                >
                  protected main
                </span>
              </div>
            ))}
          </div>

          {/* main line on the right (production) */}
          <div className="flex flex-col items-center gap-[4px]">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.5)]">
              main
            </span>
            <div className="w-[2px] h-[120px] bg-[rgba(38,35,35,0.5)] rounded-full" />
          </div>
        </div>

        {/* Caption box 1 */}
        <div className="rounded-[10px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[12px]">
          <p className="m-0 text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.85)]">
            Protected branch. Only reviewed code lands here.
          </p>
        </div>

        {/* Sub-label pill */}
        <div className="flex items-center gap-[12px]">
          <DiagramPill>Repo hygiene</DiagramPill>
          <p className="m-0 text-[13px] font-[460] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.7)]">
            README, .gitignore, branch rules, and clear project structure.
          </p>
        </div>
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 2 — DEPLOYMENT PIPELINE (Section 3: Set Up Deployments)    */
/* ------------------------------------------------------------------ */

const PIPELINE_STEPS: { name: string; desc: string }[] = [
  { name: "PR opened", desc: "code leaves a branch" },
  { name: "preview", desc: "temporary live build" },
  { name: "review", desc: "human gate" },
  { name: "staging", desc: "safe prod mirror" },
  { name: "verify", desc: "release gate" },
  { name: "production", desc: "real users" },
];

export function DeploymentPipelineDiagram() {
  return (
    <DiagramShell label="Deployment pipeline" tagline="Code moves through gates before users see it.">
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 lg:grid-cols-3 gap-[12px]">
        {PIPELINE_STEPS.map((step, i) => (
          <div
            key={step.name}
            className="relative rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[14px] py-[14px] flex flex-col gap-[6px]"
          >
            <div className="flex items-center gap-[8px]">
              <span className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-[6px] bg-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-medium leading-[12px] text-[#fbfbf8]">
                {i + 1}
              </span>
              <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                {step.name}
              </span>
            </div>
            <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.65)]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 3 — APP SCAFFOLD (Section 5: Scaffold Your App)            */
/* ------------------------------------------------------------------ */

const USER_FACING_ROUTES = [
  "marketing route",
  "app route",
  "dashboard",
  "settings",
];

const BACKEND_BOXES: { label: string; question: string }[] = [
  { label: "auth", question: "who is this user?" },
  { label: "database", question: "what should persist?" },
  { label: "storage", question: "where do files live?" },
  { label: "policies", question: "what can they access?" },
];

export function AppScaffoldDiagram() {
  return (
    <DiagramShell label="App scaffold" tagline="A scaffold is the skeleton of the product, not just a folder tree.">
      <div className="flex flex-col gap-[10px]">
        {/* Tier 1 — user-facing layer */}
        <div className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[14px]">
          <p className="m-0 mb-[10px] text-[11px] font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-[0.1em] text-[rgba(38,35,35,0.5)]">
            user-facing layer
          </p>
          <div className="flex flex-wrap gap-[8px]">
            {USER_FACING_ROUTES.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded-[8px] border border-[#E8E7E6] bg-[#FBFBF8] px-[10px] py-[4px] text-[12px] font-[460] leading-[14px] text-[rgba(38,35,35,0.8)]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Tier 2 — components + forms */}
        <div className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[14px]">
          <p className="m-0 mb-[6px] text-[11px] font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-[0.1em] text-[rgba(38,35,35,0.5)]">
            components + forms
          </p>
          <p className="m-0 text-[12px] font-[460] leading-[15px] text-[rgba(38,35,35,0.7)]">
            buttons, states, validation, loading UI
          </p>
        </div>

        {/* Tier 3 — actions / API / backend foundation */}
        <div className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[14px]">
          <p className="m-0 mb-[10px] text-[11px] font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-[0.1em] text-[rgba(38,35,35,0.5)]">
            actions / API / backend foundation
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
            {BACKEND_BOXES.map((b) => (
              <div
                key={b.label}
                className="rounded-[8px] border border-[#E8E7E6] bg-[#FBFBF8] px-[10px] py-[8px] flex items-center gap-[8px]"
              >
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[rgba(38,35,35,0.85)]">
                  {b.label}
                </span>
                <span className="text-[11px] font-[460] leading-[13px] text-[rgba(38,35,35,0.55)]">
                  — {b.question}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom caption (mono) */}
        <p className="m-0 mt-[6px] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[14px] text-[rgba(38,35,35,0.6)]">
          route renders screen -&gt; form calls action -&gt; API validates -&gt;
          database/storage changes -&gt; UI refreshes state
        </p>
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 4 — INTEGRATION MAP (Section 6: The Backend)               */
/* ------------------------------------------------------------------ */

const INTEGRATION_CARDS: {
  pill: string;
  flow: string[];
  caption: string;
}[] = [
  {
    pill: "Stripe",
    flow: ["checkout", "subscription", "invoice"],
    caption: "Webhook confirms payment before the app grants access.",
  },
  {
    pill: "Postmark",
    flow: ["signup", "reset", "receipt"],
    caption: "Transactional email should be triggered by product state.",
  },
  {
    pill: "your backend",
    flow: ["validate request", "write database", "handle webhook"],
    caption: "",
  },
];

export function IntegrationMapDiagram() {
  return (
    <DiagramShell label="Integration map" tagline="Your app needs to react when outside services send updates.">
      <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-[12px]">
        {INTEGRATION_CARDS.map((card) => (
          <div
            key={card.pill}
            className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[14px] py-[14px] flex flex-col gap-[12px]"
          >
            <DiagramPill>{card.pill}</DiagramPill>
            <div className="flex flex-col gap-[4px]">
              {card.flow.map((step, i) => (
                <div key={step} className="flex items-center gap-[6px]">
                  <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.55)] w-[16px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[12px] font-[460] leading-[15px] text-[rgba(38,35,35,0.85)]">
                    {step}
                  </span>
                  {i < card.flow.length - 1 && (
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[12px] text-[rgba(38,35,35,0.35)]">
                      ↓
                    </span>
                  )}
                </div>
              ))}
            </div>
            {card.caption && (
              <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.7)]">
                {card.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 5 — FRONTEND LOOP (Section 7: The Frontend)                */
/* ------------------------------------------------------------------ */

const LOOP_STEPS: { name: string; desc: string }[] = [
  { name: "test the app", desc: "click through the real flow" },
  { name: "find odd parts", desc: "confusing copy, dead ends, awkward states" },
  {
    name: "fix and repeat",
    desc: "ship the smallest useful improvement",
  },
];

export function FrontendLoopDiagram() {
  return (
    <DiagramShell label="Frontend loop" tagline="Use the app like a customer, then fix the parts that feel off.">
      <div className="flex flex-col gap-[16px]">
        <div className="grid grid-cols-1 min-[640px]:grid-cols-3 gap-[12px] relative">
          {LOOP_STEPS.map((step, i) => (
            <div
              key={step.name}
              className="relative rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[14px] py-[14px] flex flex-col gap-[6px]"
            >
              <div className="flex items-center gap-[8px]">
                <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] border border-[#DADAD5] bg-[#EFEFEB] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[rgba(38,35,35,0.72)]">
                  {i + 1}
                </span>
                <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                  {step.name}
                </span>
              </div>
              <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.65)]">
                {step.desc}
              </p>
              {/* arrow connector on desktop */}
              {i < LOOP_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden min-[640px]:block absolute top-1/2 -right-[10px] -translate-y-1/2 font-[family-name:var(--font-ibm-plex-mono)] text-[14px] text-[rgba(38,35,35,0.4)]"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Return-arrow row */}
        <div className="flex items-center justify-center gap-[8px]">
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.5)]">
            ↻ repeat the flow
          </span>
        </div>

        {/* Closing caption */}
        <p className="m-0 text-[13px] font-[460] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.7)] max-w-[460px]">
          Keep cycling until the product flow feels obvious to someone using it
          for the first time.
        </p>
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Diagram 6 — QUALITY CONTROL (Section 9: Testing and Quality)       */
/* ------------------------------------------------------------------ */

const QUALITY_CHECKS: { label: string; question: string }[] = [
  { label: "behavior tests", question: "does the core flow work?" },
  { label: "code hygiene", question: "is it consistent and low-risk?" },
  { label: "human review", question: "does it feel right in the app?" },
];

export function QualityControlDiagram() {
  return (
    <DiagramShell label="Quality control" tagline="Generated code needs to pass three checks before it ships.">
      <div className="flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[10px]">
          {QUALITY_CHECKS.map((check, i) => (
            <div
              key={check.label}
              className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[14px] py-[12px] flex items-center gap-[12px]"
            >
              <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-[6px] bg-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[#fbfbf8]">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-[8px]">
                <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                  {check.label}
                </span>
                <span className="text-[12px] font-[460] leading-[15px] text-[rgba(38,35,35,0.6)]">
                  — {check.question}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Warning callout */}
        <div className="rounded-[10px] border border-[#E8E7E6] bg-[#FFF7F2] px-[14px] py-[12px] flex items-start gap-[10px]">
          <span
            aria-hidden="true"
            className="shrink-0 inline-flex items-center justify-center w-[18px] h-[18px] rounded-[4px] bg-[#A76451] text-[#fbfbf8] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px]"
          >
            !
          </span>
          <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.85)]">
            Bad tests are another form of slop. They must prove user outcomes,
            not merely confirm implementation details.
          </p>
        </div>
      </div>
    </DiagramShell>
  );
}

/* =================================================================== */
/*  Spirit OS diagrams — added for the Spirit OS rewrite.               */
/*  All exported as NEW components; existing exports above are          */
/*  untouched.                                                          */
/* =================================================================== */

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 1 — SETUP_FLOW (start page, Section 2)           */
/* ------------------------------------------------------------------ */

const SETUP_STEPS: { name: string; desc: string }[] = [
  { name: "Clone repo", desc: "git clone the Spirit OS repository" },
  { name: "Install deps", desc: "npm install in server/ and client/" },
  { name: "Configure .env", desc: "SESSION_SECRET, optional AI keys" },
  { name: "Run dev servers", desc: "client :5173 · API :3001" },
];

export function SetupFlowDiagram() {
  return (
    <DiagramShell
      label="Setup flow"
      tagline="Four steps from clone to running desktop."
      subTagline="Everything below works fully offline with the Spirit NLP fallback — API keys are optional."
    >
      <div className="flex flex-col gap-[12px]">
        {SETUP_STEPS.map((step, i) => (
          <div
            key={step.name}
            className="relative rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[14px] flex items-start gap-[14px]"
          >
            <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-[6px] bg-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[#fbfbf8] shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                {step.name}
              </span>
              <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.65)]">
                {step.desc}
              </p>
            </div>
            {i < SETUP_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-[14px] left-[26px] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] text-[rgba(38,35,35,0.4)]"
              >
                ↓
              </span>
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 2 — CASCADE_FALLBACK (start page, Section 5)     */
/* ------------------------------------------------------------------ */

const CASCADE_TIERS: { tier: string; label: string; note: string; offline?: boolean }[] = [
  { tier: "1", label: "Gemini", note: "primary tool-calling agent · @google/generative-ai" },
  { tier: "2", label: "Sarvam", note: "Indic-language LLM / TTS / STT · REST" },
  { tier: "3", label: "OpenRouter", note: "free-model aggregator · fetch" },
  { tier: "4", label: "Groq", note: "fast inference · groq-sdk" },
  { tier: "5", label: "Spirit", note: "offline deterministic NLP · no API key", offline: true },
];

export function CascadeFallbackDiagram() {
  return (
    <DiagramShell
      label="Cascade fallback"
      tagline="Each tier is tried in order; failures fall through to the next."
      subTagline="The desktop always responds — even with no internet and no API keys."
    >
      <div className="flex flex-col gap-[8px]">
        {CASCADE_TIERS.map((t, i) => (
          <div key={t.label}>
            <div
              className={[
                "rounded-[12px] border px-[16px] py-[12px] flex items-center gap-[14px]",
                t.offline
                  ? "border-[#E8D9C9] bg-[#FBF4EC]"
                  : "border-[#E8E7E6] bg-[#F5F5F2]",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] shrink-0",
                  t.offline
                    ? "bg-[#A76451] text-[#fbfbf8]"
                    : "bg-[rgba(38,35,35,0.85)] text-[#fbfbf8]",
                ].join(" ")}
              >
                {t.tier}
              </span>
              <div className="flex-1 min-w-0 flex flex-wrap items-baseline gap-[8px]">
                <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                  {t.label}
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.55)]">
                  {t.note}
                </span>
              </div>
              {t.offline && (
                <span className="inline-flex items-center rounded-[100px] border border-[#E8D9C9] bg-[#FFF7F2] px-[8px] py-[3px] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[#A76451]">
                  always available
                </span>
              )}
            </div>
            {i < CASCADE_TIERS.length - 1 && (
              <div className="flex items-center gap-[6px] py-[3px] pl-[26px]">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.4)]">
                  ↓ fallback on failure
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 3 — ARCHITECTURE_LAYERS (build page, Section 1)  */
/* ------------------------------------------------------------------ */

const ARCH_LAYERS: {
  pill: string;
  tagline: string;
  nodes: string[];
}[] = [
  {
    pill: "Layer 1 — Browser",
    tagline: "React + Vite desktop shell",
    nodes: ["Desktop.jsx", "WindowFrame.jsx", "Taskbar.jsx", "15 apps"],
  },
  {
    pill: "Layer 2 — Input controllers",
    tagline: "Multimodal, shared camera, Zustand intents",
    nodes: ["Voice", "Gestures", "Eye", "Sign", "Face"],
  },
  {
    pill: "Layer 3 — Backend",
    tagline: "Express + Prisma + SQLite + AI cascade",
    nodes: ["REST routes", "WebSocket", "irisEngine.js", "mem0ai"],
  },
];

export function ArchitectureLayersDiagram() {
  return (
    <DiagramShell
      label="Architecture layers"
      tagline="Three independently swappable layers."
      subTagline="Each layer talks to the next through a typed interface — no shared global state across layers."
    >
      <div className="flex flex-col gap-[10px]">
        {ARCH_LAYERS.map((layer, i) => (
          <div key={layer.pill}>
            <div className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[14px] flex flex-col gap-[10px]">
              <div className="flex items-center justify-between gap-[12px] flex-wrap">
                <DiagramPill>{layer.pill}</DiagramPill>
                <span className="text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.65)]">
                  {layer.tagline}
                </span>
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {layer.nodes.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center rounded-[8px] border border-[#E8E7E6] bg-[#FBFBF8] px-[10px] py-[4px] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.8)]"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            {i < ARCH_LAYERS.length - 1 && (
              <div className="flex items-center justify-center py-[3px]">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.45)]">
                  ↓ typed interface
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 4 — AI_CASCADE (build page, Section 4)            */
/* ------------------------------------------------------------------ */

const AI_CASCADE_TIERS: {
  name: string;
  role: string;
  sdk: string;
  offline?: boolean;
}[] = [
  { name: "Gemini", role: "tool-calling agent · complex intent", sdk: "@google/generative-ai" },
  { name: "Sarvam", role: "Indic-language LLM · TTS · STT", sdk: "REST" },
  { name: "OpenRouter", role: "free-model aggregator", sdk: "fetch" },
  { name: "Groq", role: "fast inference · low-latency", sdk: "groq-sdk" },
  { name: "Spirit", role: "deterministic NLP fallback", sdk: "in-process · no key", offline: true },
];

export function AiCascadeDiagram() {
  return (
    <DiagramShell
      label="AI cascade"
      tagline="Iris Engine tries each tier in order; failure on one falls through to the next."
      subTagline="mem0ai sits alongside the cascade and supplies persistent user context to whichever tier runs."
    >
      <div className="flex flex-col gap-[8px]">
        {AI_CASCADE_TIERS.map((t, i) => (
          <div key={t.name}>
            <div
              className={[
                "rounded-[12px] border px-[16px] py-[12px] flex flex-col gap-[6px]",
                t.offline
                  ? "border-[#E8D9C9] bg-[#FBF4EC]"
                  : "border-[#E8E7E6] bg-[#F5F5F2]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-[12px] flex-wrap">
                <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                  {t.name}
                </span>
                <span
                  className={[
                    "inline-flex items-center rounded-[100px] border px-[8px] py-[2px] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px]",
                    t.offline
                      ? "border-[#E8D9C9] bg-[#FFF7F2] text-[#A76451]"
                      : "border-[#DADAD5] bg-[#EFEFEB] text-[rgba(38,35,35,0.72)]",
                  ].join(" ")}
                >
                  tier {i + 1}
                </span>
              </div>
              <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.7)]">
                {t.role}
              </p>
              <p className="m-0 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.55)]">
                {t.sdk}
              </p>
            </div>
            {i < AI_CASCADE_TIERS.length - 1 && (
              <div className="flex items-center gap-[6px] py-[2px] pl-[24px]">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.4)]">
                  ↓ on network / quota / timeout error
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="mt-[6px] rounded-[10px] border border-[#D7E8FF] bg-[#F7FBFF] px-[14px] py-[10px] flex items-center gap-[10px]">
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[#007EC7] uppercase tracking-[0.1em]">
            mem0ai
          </span>
          <p className="m-0 text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.7)]">
            persistent memory — supplies user context, stores new facts after each turn
          </p>
        </div>
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 5 — INPUT_PIPELINE (build page, Section 3)       */
/* ------------------------------------------------------------------ */

const INPUT_NODES: { name: string; tech: string }[] = [
  { name: "Voice", tech: "Web Speech API · Gemini Live" },
  { name: "Gestures", tech: "MediaPipe Hands WASM" },
  { name: "Eye", tech: "TensorFlow.js gaze model" },
  { name: "Sign", tech: "custom TF.js classifier" },
  { name: "Face", tech: "face-api.js" },
];

export function InputPipelineDiagram() {
  return (
    <DiagramShell
      label="Input pipeline"
      tagline="Five modalities, one shared camera, one intent stream."
      subTagline="Every controller emits the same intent shape into a single Zustand store — the desktop never cares which modality fired."
    >
      <div className="flex flex-col gap-[10px]">
        {/* Five modality cards */}
        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 lg:grid-cols-3 gap-[10px]">
          {INPUT_NODES.map((n) => (
            <div
              key={n.name}
              className="rounded-[10px] border border-[#E8E7E6] bg-[#F5F5F2] px-[12px] py-[10px] flex flex-col gap-[4px]"
            >
              <span className="text-[12px] font-[530] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.95)]">
                {n.name}
              </span>
              <p className="m-0 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[rgba(38,35,35,0.55)]">
                {n.tech}
              </p>
            </div>
          ))}
        </div>

        {/* Arrows down */}
        <div className="flex items-center justify-center">
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.45)]">
            ↓ sharedCamera.js · single getUserMedia stream
          </span>
        </div>

        {/* Shared camera + state store */}
        <div className="rounded-[12px] border border-[#D7E8FF] bg-[#F7FBFF] px-[16px] py-[12px] flex items-center justify-between gap-[12px] flex-wrap">
          <div className="flex items-center gap-[10px]">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px] text-[#007EC7] uppercase tracking-[0.1em]">
              Zustand + Immer
            </span>
            <span className="text-[12px] font-[460] leading-[15px] tracking-[0.12px] text-[rgba(38,35,35,0.7)]">
              intent store → desktop actions
            </span>
          </div>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.55)]">
            open / close / navigate / set reminder / SOS
          </span>
        </div>
      </div>
    </DiagramShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Spirit OS Diagram 6 — AUTH_FLOW (build page, Section 6)            */
/* ------------------------------------------------------------------ */

const AUTH_STEPS: { name: string; desc: string }[] = [
  { name: "Login", desc: "POST /api/auth/login · bcryptjs verify" },
  { name: "Session", desc: "express-session · HttpOnly cookie · SQLite store" },
  { name: "Scope middleware", desc: "fs:read · fs:write · vault:read · ai:complete · admin" },
  { name: "Route handler", desc: "Prisma query · AI cascade · WebSocket broadcast" },
];

export function AuthFlowDiagram() {
  return (
    <DiagramShell
      label="Auth flow"
      tagline="Session-based auth, scope-checked on every protected route."
      subTagline="Caregiver Mode adds an approval queue on top of sensitive scopes (fs:delete, vault:write, sos:dispatch)."
    >
      <div className="flex flex-col gap-[8px]">
        {AUTH_STEPS.map((step, i) => (
          <div key={step.name}>
            <div className="rounded-[12px] border border-[#E8E7E6] bg-[#F5F5F2] px-[16px] py-[12px] flex items-center gap-[14px]">
              <span className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-[6px] bg-[rgba(38,35,35,0.85)] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[13px] text-[#fbfbf8] shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
                <span className="text-[13px] font-[530] leading-[16px] tracking-[0.13px] text-[rgba(38,35,35,0.95)]">
                  {step.name}
                </span>
                <p className="m-0 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.55)]">
                  {step.desc}
                </p>
              </div>
            </div>
            {i < AUTH_STEPS.length - 1 && (
              <div className="flex items-center justify-center py-[2px]">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-[13px] text-[rgba(38,35,35,0.4)]">
                  ↓
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </DiagramShell>
  );
}

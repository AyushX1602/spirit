import { Link } from "react-router-dom";
import { SiteHeader } from "../components/site/site-header";
import { SiteFooter } from "../components/site/site-footer";

/* ------------------------------------------------------------------ */
/*  Arrow icon                                                          */
/* ------------------------------------------------------------------ */
const ArrowRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M2 7h10M7 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Resource card                                                       */
/* ------------------------------------------------------------------ */
interface Resource {
  tag: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

function ResourceCard({ r }: { r: Resource }) {
  const inner = (
    <div className="group flex flex-col gap-[16px] rounded-[16px] border border-[#E8E7E6] bg-[rgba(251,251,248,0.60)] px-[24px] py-[22px] hover:border-[rgba(38,35,35,0.18)] hover:bg-[rgba(242,242,237,0.40)] transition-colors duration-200 ease-in-out cursor-pointer h-full">
      <div className="flex items-center justify-between gap-[12px]">
        <span className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[3px] font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[16px] text-[rgba(38,35,35,0.5)] bg-[rgba(38,35,35,0.05)]">
          {r.tag}
        </span>
        <span className="text-[rgba(38,35,35,0.35)] group-hover:text-[rgba(38,35,35,0.65)] transition-colors duration-200">
          <ArrowRight />
        </span>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="m-0 text-[16px] font-[530] leading-[140%] tracking-[0.16px] text-[rgba(38,35,35,0.95)]">
          {r.title}
        </p>
        <p className="m-0 text-[14px] font-[460] leading-[155%] tracking-[0.14px] text-[rgba(38,35,35,0.60)]">
          {r.description}
        </p>
      </div>
    </div>
  );

  if (r.external) {
    return (
      <a href={r.href} target="_blank" rel="noopener noreferrer" className="no-underline block h-full">
        {inner}
      </a>
    );
  }
  return (
    <Link to={r.href} className="no-underline block h-full">
      {inner}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Resource data                                                       */
/* ------------------------------------------------------------------ */

const GUIDE_RESOURCES: Resource[] = [
  {
    tag: "Guide · Chapter I",
    title: "How to start with Spirit OS",
    description:
      "Setting up Spirit OS, picking an accessibility profile, calibrating voice, gestures, and eye tracking.",
    href: "/how-to/start",
  },
  {
    tag: "Guide · Chapter II",
    title: "How we build Spirit OS",
    description:
      "Architecture deep-dive: the browser shell, multimodal input pipeline, Iris Engine AI cascade, and the real-time WebSocket layer.",
    href: "/how-to/build",
  },
  {
    tag: "Guide · Chapter III",
    title: "Spirit OS selling points",
    description:
      "Who Spirit OS is built for — low-vision users, motor-impaired users, elderly users, caregivers, and Indic-language speakers.",
    href: "/how-to/sell",
  },
  {
    tag: "Guide · Chapter IV",
    title: "How to scale Spirit OS",
    description:
      "Expanding deployments from one user to a school, clinic, or eldercare facility — analytics, support, and expansion paths.",
    href: "/how-to/scale",
  },
];

const TECHNICAL_RESOURCES: Resource[] = [
  {
    tag: "Repository",
    title: "Spirit OS on GitHub",
    description:
      "Full source code under the Apache-2.0 license. Client (Vite + React), server (Express + Prisma), and input controllers.",
    href: "https://github.com",
    external: true,
  },
  {
    tag: "Reference",
    title: "Iris Engine — AI cascade reference",
    description:
      "How irisEngine.js orchestrates Gemini → Sarvam → OpenRouter → Groq → Spirit (offline NLP) with mem0ai persistent memory.",
    href: "/how-to/build#the-iris-engine-ai-cascade",
  },
  {
    tag: "Reference",
    title: "Multimodal input pipeline",
    description:
      "Voice, gesture, eye tracking, sign language, and face recognition — each controller, its model, and shared camera coordination.",
    href: "/how-to/build#multimodal-input-pipeline",
  },
  {
    tag: "Reference",
    title: "Authentication, sessions, and the Vault",
    description:
      "Session-based auth with bcryptjs, face-recognition unlock, HttpOnly cookies, and the AES-encrypted Vault for sensitive data.",
    href: "/how-to/build#authentication-sessions-and-the-vault",
  },
];

const ACCESSIBILITY_RESOURCES: Resource[] = [
  {
    tag: "Accessibility",
    title: "Accessibility profiles",
    description:
      "Five built-in profiles — High-contrast, Large-font, Reduced-motion, Caregiver Mode, and Alzheimer Support.",
    href: "/how-to/start#pick-profile",
  },
  {
    tag: "Accessibility",
    title: "Caregiver mode and Known Book",
    description:
      "Remote approval for sensitive actions, full audit log, emergency contacts, and Alzheimer-safe guided navigation.",
    href: "/how-to/sell#for-alzheimers-and-dementia-caregivers",
  },
  {
    tag: "Accessibility",
    title: "Indic language support via Sarvam",
    description:
      "Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati, Odia, Malayalam — voice commands and TTS in the user's language.",
    href: "/how-to/sell#for-indic-language-speakers",
  },
  {
    tag: "Accessibility",
    title: "SOS emergency panel",
    description:
      "One-click SOS overlay with GPS location, emergency contacts, live video, and one-tap call — always visible in the taskbar.",
    href: "/how-to/scale#add-customer-support-and-sos",
  },
];

/* ------------------------------------------------------------------ */
/*  Section header                                                      */
/* ------------------------------------------------------------------ */
function SectionHeader({ label, title, desc }: { label: string; title: string; desc: string }) {
  return (
    <div className="mb-[40px]">
      <p className="m-0 font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[rgba(38,35,35,0.45)] uppercase tracking-[0.06em] mb-[12px]">
        {label}
      </p>
      <h2
        className="m-0 text-[28px] font-normal leading-[120%] text-[rgba(38,35,35,0.95)] mb-[14px]"
        style={{ fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif" }}
      >
        {title}
      </h2>
      <p className="m-0 text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.60)] max-w-[560px]">
        {desc}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function ResourcesPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[91px] min-[1000px]:pt-[120px] pb-[120px] bg-[#FBFBF8]">
        {/* Hero */}
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[60px] min-[1000px]:py-[80px]">
          <div
            className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[4px] font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[rgba(38,35,35,0.5)] whitespace-nowrap mb-[24px]"
            style={{
              background:
                "linear-gradient(rgba(251,251,248,0.5) 0%, rgba(251,251,248,0) 100%)",
            }}
          >
            Resources
          </div>
          <h1
            className="m-0 text-[36px] min-[700px]:text-[48px] font-normal leading-[115%] text-[rgba(38,35,35,0.95)] max-w-[680px]"
            style={{ fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif" }}
          >
            Everything you need to run Spirit OS
          </h1>
          <p className="mt-[24px] m-0 text-[16px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.60)] max-w-[560px]">
            Guides, technical references, and accessibility documentation — all in one place.
          </p>

          {/* Quick launch CTA */}
          <div className="mt-[36px] flex flex-wrap gap-[12px]">
            <a
              href="/app"
              className="group relative inline-flex h-[44px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[10px] px-[20px] cta-btn"
            >
              <span
                className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="relative z-10 font-[460] text-[15px] tracking-[0.15px] text-[#1a1a1a]">
                Launch Spirit OS
              </span>
            </a>
            <Link
              to="/how-to/start"
              className="group inline-flex h-[44px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[10px] px-[20px] border border-[#E8E7E6] text-[rgba(38,35,35,0.8)] hover:border-[rgba(38,35,35,0.2)] hover:bg-[rgba(38,35,35,0.03)] transition-colors duration-200 ease-in-out"
            >
              <span className="font-[460] text-[15px] tracking-[0.15px]">Get started</span>
            </Link>
          </div>
        </section>

        {/* Guides section */}
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[60px] border-t border-[#E8E7E6]">
          <SectionHeader
            label="How to"
            title="Step-by-step guides"
            desc="Four chapters covering everything from first setup to scaling Spirit OS across a full facility deployment."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {GUIDE_RESOURCES.map((r) => (
              <ResourceCard key={r.href} r={r} />
            ))}
          </div>
        </section>

        {/* Technical references section */}
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[60px] border-t border-[#E8E7E6]">
          <SectionHeader
            label="Technical"
            title="Architecture and code references"
            desc="Deep dives into the systems that power Spirit OS — from the AI cascade to the virtual filesystem."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {TECHNICAL_RESOURCES.map((r) => (
              <ResourceCard key={r.href + r.title} r={r} />
            ))}
          </div>
        </section>

        {/* Accessibility section */}
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[60px] border-t border-[#E8E7E6]">
          <SectionHeader
            label="Accessibility"
            title="Accessibility features"
            desc="Profiles, caregiver tools, Indic-language support, and the SOS panel — designed for users traditional OS forgot."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {ACCESSIBILITY_RESOURCES.map((r) => (
              <ResourceCard key={r.href + r.title} r={r} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[60px] border-t border-[#E8E7E6]">
          <div className="rounded-[20px] bg-[rgba(242,242,237,0.60)] border border-[#E8E7E6] px-[32px] py-[48px] flex flex-col items-center text-center gap-[20px]">
            <h2
              className="m-0 text-[28px] font-normal leading-[120%] text-[rgba(38,35,35,0.95)] max-w-[480px]"
              style={{ fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif" }}
            >
              Ready to experience it?
            </h2>
            <p className="m-0 text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.60)] max-w-[380px]">
              Spirit OS runs entirely in the browser — no install, no setup fee, no hardware required.
            </p>
            <a
              href="/app"
              className="group relative inline-flex h-[48px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[10px] px-[28px] cta-btn"
            >
              <span
                className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="relative z-10 font-[460] text-[16px] tracking-[0.15px] text-[#1a1a1a]">
                Launch Spirit OS →
              </span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Shared "How to" chapter sidebar for Spirit OS.
 *
 * Renders all four chapters with their section sub-links.
 * The current chapter is highlighted with stronger color and a left border.
 * Sub-links scroll to section anchors within the current chapter page.
 * Sticky on desktop, hidden on mobile.
 */

type ChapterSlug = "start" | "build" | "sell" | "scale";

interface SubLink {
  label: string;
  anchor: string; // hash without '#'
}

interface Chapter {
  roman: string;
  title: string;
  slug: ChapterSlug;
  subLinks: SubLink[];
}

const CHAPTERS: Chapter[] = [
  {
    roman: "I",
    title: "How to start",
    slug: "start",
    subLinks: [
      { label: "Introduction", anchor: "intro" },
      { label: "Should you use Spirit OS?", anchor: "should-you-use" },
      { label: "Setting up Spirit OS", anchor: "setting-up" },
      { label: "Pick an accessibility profile", anchor: "pick-profile" },
      { label: "Calibrate input modalities", anchor: "calibrate" },
      { label: "Issue your first voice command", anchor: "first-command" },
      { label: "Take the leap", anchor: "take-the-leap" },
    ],
  },
  {
    roman: "II",
    title: "Build",
    slug: "build",
    subLinks: [
      { label: "Introduction", anchor: "intro" },
      { label: "Architecture overview", anchor: "architecture-overview" },
      { label: "The desktop shell", anchor: "the-desktop-shell" },
      { label: "Multimodal input pipeline", anchor: "multimodal-input-pipeline" },
      { label: "The Iris Engine AI cascade", anchor: "the-iris-engine-ai-cascade" },
      { label: "Virtual filesystem and document parsing", anchor: "virtual-filesystem-and-document-parsing" },
      { label: "Authentication, sessions, and the Vault", anchor: "authentication-sessions-and-the-vault" },
      { label: "Real-time events and WebSocket", anchor: "real-time-events-and-websocket" },
      { label: "What comes next", anchor: "what-comes-next" },
    ],
  },
  {
    roman: "III",
    title: "Selling point",
    slug: "sell",
    subLinks: [
      { label: "Introduction", anchor: "intro" },
      { label: "For low-vision users", anchor: "for-low-vision-users" },
      { label: "For motor-impaired users", anchor: "for-motor-impaired-users" },
      { label: "For elderly users", anchor: "for-elderly-users" },
      { label: "For Alzheimer's caregivers", anchor: "for-alzheimers-and-dementia-caregivers" },
      { label: "For Indic-language speakers", anchor: "for-indic-language-speakers" },
      { label: "For developers and educators", anchor: "for-developers-and-educators" },
      { label: "What makes Spirit OS different", anchor: "what-makes-spirit-os-different" },
    ],
  },
  {
    roman: "IV",
    title: "How to scale",
    slug: "scale",
    subLinks: [
      { label: "Introduction", anchor: "intro" },
      { label: "Start with the scaling loop", anchor: "start-with-the-scaling-loop" },
      { label: "Add user analytics and feedback", anchor: "add-user-analytics-and-feedback" },
      { label: "Add customer support and SOS", anchor: "add-customer-support-and-sos" },
      { label: "Understand unit economics", anchor: "understand-unit-economics" },
      { label: "Expand the business", anchor: "expand-the-business" },
      { label: "What comes next", anchor: "what-comes-next" },
    ],
  },
];

function slugToAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function ChapterSidebar({ active }: { active: ChapterSlug }) {
  const [activeAnchor, setActiveAnchor] = useState<string>("intro");

  // Track which section is in view using IntersectionObserver
  useEffect(() => {
    const allAnchors = CHAPTERS.flatMap((c) => c.subLinks.map((s) => s.anchor));
    const observers: IntersectionObserver[] = [];
    const visible = new Set<string>();

    const updateActive = () => {
      // Pick the topmost visible anchor
      for (const anchor of allAnchors) {
        if (visible.has(anchor)) {
          setActiveAnchor(anchor);
          return;
        }
      }
    };

    allAnchors.forEach((anchor) => {
      const el = document.getElementById(anchor);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.add(anchor);
          } else {
            visible.delete(anchor);
          }
          updateActive();
        },
        { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [active]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string,
    chapterSlug: ChapterSlug
  ) => {
    if (chapterSlug === active) {
      // Same page — smooth scroll to anchor
      e.preventDefault();
      const el = document.getElementById(anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveAnchor(anchor);
      }
    }
    // Different page — let Link navigate normally
  };

  return (
    <nav
      aria-label="How to chapters"
      className="flex flex-col gap-[20px] pt-[8px]"
    >
      <p className="m-0 text-[11px] font-[530] leading-[140%] tracking-[0.08em] text-[rgba(38,35,35,0.4)] uppercase">
        How to run Spirit OS
      </p>

      <ul className="m-0 p-0 list-none flex flex-col gap-[2px]">
        {CHAPTERS.map((c) => {
          const isActive = c.slug === active;
          return (
            <li key={c.slug} className="flex flex-col">
              {/* Chapter heading row */}
              <Link
                to={`/how-to/${c.slug}`}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group flex items-center gap-[10px] no-underline",
                  "rounded-[6px] px-[10px] py-[8px]",
                  "border-l-[2px] transition-colors duration-200 ease-in-out",
                  isActive
                    ? "border-l-[rgba(38,35,35,0.85)] bg-[rgba(38,35,35,0.04)]"
                    : "border-l-transparent hover:bg-[rgba(38,35,35,0.03)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-medium leading-[16px] tracking-[0.06em] shrink-0",
                    isActive
                      ? "text-[rgba(38,35,35,0.6)]"
                      : "text-[rgba(38,35,35,0.4)] group-hover:text-[rgba(38,35,35,0.55)]",
                  ].join(" ")}
                >
                  ({c.roman})
                </span>
                <span
                  className={[
                    "text-[13px] font-[530] leading-[140%] tracking-[0.13px]",
                    isActive
                      ? "text-[rgba(38,35,35,0.95)]"
                      : "text-[rgba(38,35,35,0.65)] group-hover:text-[rgba(38,35,35,0.80)]",
                  ].join(" ")}
                >
                  {c.title}
                </span>
              </Link>

              {/* Sub-links (only visible for the active chapter) */}
              {isActive && (
                <ul className="m-0 p-0 list-none flex flex-col gap-[0px] pl-[22px]">
                  {c.subLinks.map((sub) => {
                    const isSubActive = activeAnchor === sub.anchor;
                    return (
                      <li key={sub.anchor}>
                        <a
                          href={`#${sub.anchor}`}
                          onClick={(e) => handleAnchorClick(e, sub.anchor, c.slug)}
                          className={[
                            "block no-underline py-[5px] px-[10px] text-[12px] leading-[140%] tracking-[0.12px]",
                            "rounded-[4px] transition-colors duration-150 ease-in-out",
                            "border-l-[1.5px]",
                            isSubActive
                              ? "border-l-[rgba(38,35,35,0.5)] text-[rgba(38,35,35,0.85)] font-[510]"
                              : "border-l-transparent text-[rgba(38,35,35,0.5)] hover:text-[rgba(38,35,35,0.70)] font-[460]",
                          ].join(" ")}
                        >
                          {sub.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

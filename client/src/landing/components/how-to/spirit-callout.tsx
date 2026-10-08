import { Link } from "react-router-dom";

/**
 * SPIRIT_FEATURE_CALLOUT
 *
 * Blue-tinted card that interrupts the body copy to highlight a specific
 * Spirit OS capability. Same structural pattern and classes as
 * CofounderFeatureCallout (recon/shared-components.md §6), with Spirit OS
 * branding and a CTA that points to /login.
 *
 * Server component (no "use client") — hover effects are pure CSS group-hover.
 *
 * The original cofounder-callout.tsx file is left untouched; this is a
 * Spirit OS-specific sibling.
 */

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

export function SpiritFeatureCallout({
  label = "Spirit OS feature",
  description,
}: {
  label?: string;
  description: string;
}) {
  return (
    <div className="w-full max-w-[680px] mb-[56px] rounded-[16px] border border-[#D7E8FF] bg-[#F7FBFF] flex flex-col items-center self-stretch mt-[40px]">
      <div className="w-full flex flex-col gap-[20px] items-start px-[20px] py-[22px]">
        <div className="flex w-full flex-wrap items-center justify-between gap-[12px]">
          <div className="inline-flex items-center justify-center rounded-[100px] px-[8px] py-[4px] relative overflow-hidden">
            <span className="relative font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[16px] text-[#007EC7] whitespace-nowrap">
              {label}
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

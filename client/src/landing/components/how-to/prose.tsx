/**
 * Shared typographic helpers for the how-to chapter pages.
 *
 * Verbatim classes from recon/shared-components.md §5 (SECTION_BLOCK) and §4
 * (BODY_PARA). All server components (no "use client").
 *
 *   BodyPara       — 15px / weight 460 / 160% leading / 70% ink
 *   SectionH2      — 24px / weight 530 / 140% leading / full ink
 *   SectionH3      — 15px / weight 530 / 140% leading / full ink / mt-[40px]
 *   ListLabel      — 15px / weight 460 / 140% leading / ink-faint / mt-[40px]
 *   BulletList     — custom beaded bullets, no native markers
 *   SectionDivider — 1px hairline rule between sibling H3s
 *   Strong         — inline <strong> at weight 530 + full ink
 */

export function BodyPara({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`m-0 text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.70)] ${className}`}
    >
      {children}
    </p>
  );
}

function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function SectionH2({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  // Auto-derive id from text content if not provided
  const derivedId =
    id ??
    (typeof children === "string"
      ? textToSlug(children)
      : undefined);
  return (
    <h2
      id={derivedId}
      className="m-0 text-[24px] font-[530] leading-[140%] tracking-[0.24px] text-[rgba(38,35,35,0.95)] scroll-mt-[140px]"
    >
      {children}
    </h2>
  );
}

export function SectionH3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 text-[15px] font-[530] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.95)] mt-[40px]">
      {children}
    </h3>
  );
}

export function ListLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`m-0 text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.5)] mt-[40px] ${className}`}
    >
      {children}
    </p>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="m-0 flex flex-col gap-[12px] list-none pl-0 mt-[24px]">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex gap-[12px] items-start text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.70)]"
        >
          <span className="mt-[8px] shrink-0 w-[8px] h-[8px] rounded-[24px] border-[1.5px] border-[rgba(190,190,190,0.50)] bg-[#F5F5F2] shadow-[0_1px_1px_0_#FFF,inset_0_0_0.357px_1.071px_#FFF,inset_0_0_0.357px_1.071px_rgba(255,255,255,0.50)]" />
          <span className="flex-1">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function SectionDivider() {
  return (
    <hr className="m-0 border-0 h-[1px] bg-[rgba(190,190,190,0.30)] my-[20px]" />
  );
}

export function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-[530] text-[rgba(38,35,35,0.95)]">
      {children}
    </strong>
  );
}

/**
 * Numbered card — used for ordered steps in build Sections 3 and 8.
 * Distinct visual from BulletList: a small numeral badge precedes each item.
 */
export function NumberedList({
  items,
}: {
  items: { label?: string; description: React.ReactNode }[];
}) {
  return (
    <ol className="m-0 p-0 list-none flex flex-col gap-[20px] mt-[24px]">
      {items.map((it, i) => (
        <li key={i} className="flex gap-[16px] items-start">
          <span className="shrink-0 w-[26px] h-[26px] rounded-[8px] border border-[#E8E7E6] bg-[#FBFBF8] inline-flex items-center justify-center font-[family-name:var(--font-ibm-plex-mono)] text-[12px] font-medium leading-[14px] text-[rgba(38,35,35,0.7)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            {it.label && (
              <p className="m-0 text-[15px] font-[530] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.95)]">
                {it.label}
              </p>
            )}
            <div
              className={
                it.label
                  ? "mt-[6px] text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.70)]"
                  : "text-[15px] font-[460] leading-[160%] tracking-[0.15px] text-[rgba(38,35,35,0.70)]"
              }
            >
              {it.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

import { Link } from "react-router-dom";

/**
 * READ_NEXT_CHAPTER_CTA — closing CTA link with hover-slide arrow.
 * Verbatim style from recon/shared-components.md §9.
 */
export function ReadNextChapterCta({
  to,
  href,
  label,
}: {
  to?: string;
  href?: string;
  label: string;
}) {
  const destination = to || href || "#";
  return (
    <div className="mt-[80px]">
      <Link
        to={destination}
        className="group inline-flex items-center gap-[6px] no-underline whitespace-nowrap text-[12px] font-normal leading-[16px] text-[rgba(38,35,35,0.50)] hover:text-[rgba(38,35,35,0.85)] transition-colors duration-200 ease-in-out"
      >
        <span>{label}</span>
        <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,translate,transform] duration-300 ease-out">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 6h10M6 1l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </Link>
    </div>
  );
}

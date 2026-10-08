/**
 * Shared diagram label pill — uppercase IBM Plex Mono pill used at the top of
 * every diagram on the how-to pages (e.g. "MARKET SIZE", "VERSION CONTROL",
 * "DEPLOYMENT PIPELINE", "APP SCAFFOLD", "INTEGRATION MAP", "FRONTEND LOOP",
 * "QUALITY CONTROL").
 *
 * Verbatim class from recon/shared-components.md §3 (MARKET_SIZE_PILL):
 *   inline-flex items-center rounded-[100px] border px-[7px] py-[3px]
 *   font-[family-name:var(--font-ibm-plex-mono)] text-[10px] leading-[12px]
 *   border-[#DADAD5] bg-[#EFEFEB] text-[rgba(38,35,35,0.72)]
 *
 * Server component (no "use client").
 */

export function DiagramPill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[100px] border border-[#DADAD5] bg-[#EFEFEB] px-[7px] py-[3px] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-medium leading-[12px] text-[rgba(38,35,35,0.72)] uppercase tracking-[0.1em] whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

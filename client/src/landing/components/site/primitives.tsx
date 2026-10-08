
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   Scroll reveal hook — adds .is-visible when element enters viewport
   ============================================================ */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ============================================================
   CTA button — primary light CTA ("Run a company" / "Start in Cofounder")
   ============================================================ */
type CTAVariant = "light" | "dark";

export function CTAButton({
  href,
  children,
  variant = "light",
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  variant?: CTAVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  const base =
    "group relative inline-flex h-[41px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] px-[20px]";
  const layer = variant === "dark" ? "cta-btn-dark" : "cta-btn";

  return (
    <a href={href} className={`${base} ${layer} ${className}`} style={style}>
      <span
        className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />
      <span
        className="relative z-10 font-[460] text-[15px] tracking-[0.15px]"
        style={{ color: variant === "dark" ? "#fbfbf8" : "#1a1a1a" }}
      >
        {children}
      </span>
    </a>
  );
}

/* ============================================================
   Glass pill button — secondary CTA on hero ("Check out the launch")
   ============================================================ */
export function GlassPillButton({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      className={`group relative inline-flex h-[41px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] px-[20px] glass-pill ${className}`}
      style={style}
    >
      <span
        className="glass-pill-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="relative z-10 font-[460] text-[15px] tracking-[0.15px] text-[#fbfbf8]">
        {children}
      </span>
    </a>
  );
}

/* ============================================================
   Light surface button — primary hero CTA ("Run a company")
   ============================================================ */
export function LightSurfaceButton({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={href}
      className={`group relative inline-flex h-[41px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] px-[20px] btn-light-surface ${className}`}
      style={style}
    >
      <span
        className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="relative z-10 font-[460] text-[15px] tracking-[0.15px] text-[#1a1a1a]">
        {children}
      </span>
    </a>
  );
}

/* ============================================================
   Section wrapper — standard section container with max-width
   ============================================================ */
export function Section({
  id,
  children,
  className = "",
  style,
  bg,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bg?: string;
}) {
  return (
    <section
      id={id}
      className={`w-full ${className}`}
      style={{ background: bg, ...style }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px]">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   Reveal wrapper — fades children in when scrolled into view
   ============================================================ */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

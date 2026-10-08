
import { Link } from "react-router-dom";
import { useRef } from "react";

const HOW_TO_LINKS = [
  { label: "How to start", href: "/how-to/start" },
  { label: "Build", href: "/how-to/build" },
  { label: "Selling point", href: "/how-to/sell" },
  { label: "How to scale", href: "/how-to/scale" },
];

const SITE_LINKS = [
  { label: "Homepage", href: "/" },
  { label: "Resources", href: "/resources" },
  { label: "Launch Spirit OS", href: "/login" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Docs", href: "#" },
];

export function SiteFooter() {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--hover-tilt-x", `${x * 30}px`);
    el.style.setProperty("--hover-tilt-y", `${y * 30}px`);
  };

  const onMouseLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--hover-tilt-x", `0px`);
    el.style.setProperty("--hover-tilt-y", `0px`);
  };

  return (
    <footer
      className="relative w-full overflow-hidden bg-[#f5f5f2]"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Background picture */}
      <picture className="pointer-events-none absolute inset-0 -z-10">
        <source srcSet="/img/footer/footer-bg.avif" type="image/avif" />
        <source srcSet="/img/footer/footer-bg.webp" type="image/webp" />
        <img
          src="/img/footer/footer-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </picture>

      {/* Radial fade so content reads against the photo */}
      <div className="pointer-events-none absolute inset-0 -z-10 radial-bg-gradient" />

      <div className="relative w-full max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] pt-[120px] pb-[40px]">
        {/* Top: headline + CTA */}
        <div className="flex flex-col min-[768px]:flex-row min-[768px]:items-end min-[768px]:justify-between gap-[40px] min-[768px]:gap-[80px] mb-[80px]">
          <div className="max-w-[600px]">
            <h2 className="m-0 text-[40px] min-[767px]:text-[40px] font-[400] leading-[115%] tracking-[-0.01em] text-[rgba(38,35,35,0.9)] max-w-[404px]">
              Run an entire accessible desktop with AI
            </h2>
            <p className="mt-4 max-w-[460px] text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.7)]">
              Spirit OS is an accessible, AI-powered desktop operating system designed to run entirely in the browser.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="/app"
              className="group relative inline-flex h-[48px] w-[180px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] cta-btn"
            >
              <span
                className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="relative z-10 font-[460] text-[16px] tracking-[0.15px] text-[#1a1a1a]">
                Launch Spirit OS
              </span>
            </a>
          </div>
        </div>

        {/* Middle: link columns + brand card */}
        <div className="grid grid-cols-1 min-[768px]:grid-cols-[1fr_1fr_1fr] gap-[48px] min-[768px]:gap-[80px] mb-[80px]">
          {/* How to column */}
          <div>
            <h4 className="m-0 mb-[16px] text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)] uppercase">
              How to
            </h4>
            <ul className="m-0 p-0 list-none flex flex-col gap-[10px]">
              {HOW_TO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className="footer-link text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.8)] no-underline hover:text-[rgba(38,35,35,1)] transition-colors duration-200 ease-in-out"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site links column */}
          <div>
            <h4 className="m-0 mb-[16px] text-[13px] font-[460] leading-[140%] tracking-[0.13px] text-[rgba(38,35,35,0.5)] uppercase">
              Site
            </h4>
            <ul className="m-0 p-0 list-none grid grid-cols-1 gap-[10px]">
              {SITE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href === "/login" ? "/app" : l.href}
                    className="footer-link text-[15px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(38,35,35,0.8)] no-underline hover:text-[rgba(38,35,35,1)] transition-colors duration-200 ease-in-out"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand statement */}
          <div className="flex flex-col gap-[24px]">
            <p className="m-0 text-[24px] font-[460] leading-[115%] text-[rgba(38,35,35,0.85)] max-w-[400px]">
              Spirit OS is an accessible desktop OS designed to make computing available to everyone — voice, gesture, eye tracking, sign language, and AI in one browser-based workspace.
            </p>
          </div>
        </div>

        {/* SOC 2 row */}
        <div className="flex items-center gap-[10px] mb-[24px] text-[13px] font-[460] tracking-[0.13px] text-[rgba(38,35,35,0.7)]">
          <img src="/img/footer-icons/lock.svg" alt="" className="w-[12px] h-[12px]" />
          <span style={{ fontWeight: 530, fontSize: "10px", letterSpacing: "0.13px" }}>
            Accessible by design · WCAG-aligned
          </span>
        </div>

        {/* Holo-rainbow band — follows pointer */}
        <div
          ref={tiltRef}
          className="footer-holo-rainbow h-[3px] w-full mb-[24px] rounded-full"
          aria-hidden="true"
        />

        {/* Bottom row */}
        <div className="flex flex-col min-[768px]:flex-row items-start min-[768px]:items-center justify-between gap-[16px]">
          <p className="m-0 text-[12px] font-[460] leading-[140%] tracking-[0.12px] text-[rgba(38,35,35,0.7)]">
            Copyright © 2026 Team Spirit · Apache-2.0 License
          </p>
          <p className="m-0 text-[12px] font-[460] leading-[140%] tracking-[0.12px] text-[#549f4b] flex items-center gap-[6px]">
            Made with
            <img
              src="/img/footer-icons/pixel-c.svg"
              alt=""
              className="w-[12px] h-[12px] inline-block"
            />
            by Team Spirit
          </p>
          <p className="m-0 text-[12px] font-[460] leading-[140%] tracking-[0.12px] text-[rgba(38,35,35,0.5)]">
            Built for low-vision, motor-impaired, elderly, and caregiver users
          </p>
        </div>
      </div>
    </footer>
  );
}

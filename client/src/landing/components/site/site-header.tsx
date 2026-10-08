
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Start", href: "/how-to/start" },
  { label: "Build", href: "/how-to/build" },
  { label: "Selling Point", href: "/how-to/sell" },
  { label: "Scale", href: "/how-to/scale" },
] as const;

function LogoWordmark({ scrolled }: { scrolled: boolean }) {
  const fill = scrolled ? "rgba(38,35,35,0.8)" : "#ffffff";
  return (
    <span
      className="flex items-baseline gap-[6px] h-[18px] min-[1000px]:h-[26px] font-[400]"
      style={{
        color: fill,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-departure-mono), 'Departure Mono', monospace",
          fontSize: "18px",
          lineHeight: 1,
          letterSpacing: "0.06em",
          textTransform: "lowercase",
        }}
      >
        spirit os
      </span>
      <span
        className="text-[10px] min-[1000px]:text-[12px] font-normal opacity-60 tracking-[0.02em]"
        style={{
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
        }}
      >
        by Team Spirit
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close mobile menu when a nav link is clicked — handled at the link level
  // (see onClick on mobile-menu links below) instead of via pathname effect,
  // to avoid setState-in-effect lint rule.

  const solid = scrolled || menuOpen;
  const headerBg = solid ? "bg-[#f5f5f2]" : "bg-transparent";
  const headerBorder = solid
    ? "border-b border-[#e8e7e6] shadow-[0_1px_0_0_#ffffff]"
    : "border-b border-transparent";

  const linkColor = solid ? "rgba(32,32,32,0.8)" : "#fbfbf8";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[201] flex justify-center ${headerBg} ${headerBorder}`}
        style={{
          transition:
            "border-color 0.02s ease-in-out, box-shadow 0.02s ease-in-out, background-color 0.12s ease-out 0.03s",
        }}
      >
        <div className="w-full max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px] py-[18px] min-[1000px]:py-0 min-[1000px]:pt-[26px] min-[1000px]:pb-[23px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" aria-label="Home" className="shrink-0">
            <LogoWordmark scrolled={solid} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden min-[1000px]:block">
            <nav className="flex items-center gap-3">
              {/* How to compound pill */}
              <div className="group relative flex h-[41px] items-center pl-[14px] pr-[10px] rounded-[8px] glass-pill">
                <span
                  className="glass-pill-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span
                  className="nav-link relative z-10 pointer-events-none cursor-default whitespace-nowrap px-[6px] text-[15px] leading-[150%] tracking-[0.15px] font-[410]"
                  style={{ color: solid ? "rgba(32,32,32,0.5)" : "rgba(251,251,248,0.64)" }}
                >
                  How to
                </span>
                <img
                  src="/img/navbar/divider.png"
                  width={1}
                  height={16}
                  alt=""
                  className="mx-1 h-[11px] w-px opacity-70"
                />
                {NAV_LINKS.map((l) => (
                  <span
                    key={l.href}
                    className="group/link relative z-10 inline-flex items-center justify-center rounded-[4px] py-[2px] px-[5px]"
                  >
                    <span
                      className="pointer-events-none absolute inset-0 rounded-[4px] bg-[rgba(251,251,248,0.12)] opacity-0 transition-opacity duration-200 ease-out group-hover/link:opacity-100"
                      aria-hidden="true"
                    />
                    <Link
                      to={l.href}
                      className="nav-link relative z-10 no-underline whitespace-nowrap px-[6px] text-[15px] leading-[150%] tracking-[0.15px] font-[410] transition-colors duration-200 ease-in-out"
                      style={{ color: linkColor }}
                    >
                      {l.label}
                    </Link>
                  </span>
                ))}
              </div>

              {/* Resources pill */}
              <div className="group relative flex h-[41px] w-[108px] items-center justify-center rounded-[8px] glass-pill">
                <span
                  className="glass-pill-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                  aria-hidden="true"
                />
                <Link
                  to="/resources"
                  className="nav-link relative z-10 no-underline whitespace-nowrap text-[15px] leading-[150%] tracking-[0.15px] font-[410] transition-colors duration-200 ease-in-out"
                  style={{ color: linkColor }}
                >
                  Resources
                </Link>
              </div>

              {/* CTA */}
              <a
                href="/app"
                className="group relative inline-flex h-[41px] w-[150px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] cta-btn"
              >
                <span
                  className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="relative z-10 font-[460] text-[15px] tracking-[0.15px] text-[#1a1a1a]">
                  Launch Spirit OS
                </span>
              </a>
            </nav>
          </div>

          {/* Mobile nav */}
          <div className="flex items-center min-[1000px]:hidden">
            <a
              href="/app"
              className="group relative inline-flex h-[41px] w-[150px] items-center justify-center no-underline whitespace-nowrap cursor-pointer rounded-[8px] cta-btn"
            >
              <span
                className="cta-btn-dark-hover pointer-events-none absolute inset-0 rounded-[8px] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="relative z-10 font-[460] text-[15px] tracking-[0.15px] text-[#1a1a1a]">
                Launch Spirit OS
              </span>
            </a>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="ml-3 relative flex h-[41px] w-[41px] items-center justify-center rounded-[8px] glass-pill"
              style={{
                backgroundColor: solid ? "#f5f5f2" : "transparent",
                border: solid ? "1px solid rgba(32,32,32,0.10)" : "1px solid transparent",
              }}
            >
              <span className="relative z-10 flex flex-col items-center justify-center w-[18px] h-[14px]">
                <span
                  className="absolute block h-[1.5px] w-full rounded-full origin-center"
                  style={{
                    background: solid ? "#202020" : "#fbfbf8",
                    transform: menuOpen
                      ? "translateY(0) rotate(45deg)"
                      : "translateY(-5px) rotate(0deg)",
                    transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
                  }}
                />
                <span
                  className="absolute block h-[1.5px] w-full rounded-full origin-center"
                  style={{
                    background: solid ? "#202020" : "#fbfbf8",
                    opacity: menuOpen ? 0 : 1,
                    transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
                    transition:
                      "transform 0.3s cubic-bezier(0.23,1,0.32,1), opacity 0.3s cubic-bezier(0.23,1,0.32,1)",
                  }}
                />
                <span
                  className="absolute block h-[1.5px] w-full rounded-full origin-center"
                  style={{
                    background: solid ? "#202020" : "#fbfbf8",
                    transform: menuOpen
                      ? "translateY(0) rotate(-45deg)"
                      : "translateY(5px) rotate(0deg)",
                    transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[200] min-[1000px]:hidden bg-[#f5f5f2]"
          style={{ animation: "0.4s cubic-bezier(0.23,1,0.32,1) forwards mm-bg-in" }}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 flex flex-col items-center justify-center px-[20px] gap-0 pt-[62px]">
              <span className="text-[24px] font-[410] tracking-[-0.3px] text-[#bfbfbf] no-underline py-[10px]">
                How to
              </span>
              {NAV_LINKS.map((l, i) => (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[40px] font-[400] tracking-[-0.3px] text-[rgba(38,35,35,0.8)] no-underline leading-[160%]"
                  style={{
                    animation: `0.5s ease-out ${0.15 + i * 0.05}s both mm-link-in`,
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-6 border-t border-[#e3e3e0]" style={{ width: "100px" }} />
              <Link
                to="/resources"
                onClick={() => setMenuOpen(false)}
                className="text-[40px] font-[400] tracking-[-0.3px] text-[rgba(38,35,35,0.8)] no-underline leading-[160%]"
                style={{ animation: "0.5s ease-out 0.4s both mm-link-in" }}
              >
                Resources
              </Link>
            </nav>
            <p className="m-0 text-center text-[#bfbfbf] text-[12px] font-[460] leading-[140%] tracking-[0.12px] pb-[40px] px-[20px]">
              Copyright © 2026 Team Spirit · Apache-2.0 License
            </p>
          </div>
        </div>
      )}
    </>
  );
}

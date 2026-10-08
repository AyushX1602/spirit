import { AuthCard } from "./AuthCard";


/* ============================================================
   /login page — split-screen.
   Left: pixel-art carousel (blue gradient + 4 decorative WebPs
         positioned at corners). Hidden on mobile (< 1000 px).
   Right: auth card (384 px desktop / full-width mobile).

   No SiteHeader. Minimal copyright-only footer.

   The 4 WebP illustrations live in /public/img/login/ and are
   positioned absolutely on top of the blue gradient — exactly
   as on app.cofounder.co/login (spec-08 §12).
   ============================================================ */

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "#f1f1ee" }}
    >
      {/* ===========================================================
          LEFT — pixel-art carousel (desktop ≥ 1000px only)
          =========================================================== */}
      <section
        aria-hidden="true"
        className="relative isolate flex h-full min-h-0 w-full overflow-hidden hidden min-[1000px]:flex"
        style={{
          background:
            "linear-gradient(135deg, rgb(47, 145, 231) 0%, rgb(109, 182, 239) 100%)",
        }}
      >
        {/* Decorative WebP images positioned at the four corners */}
        <img
          src="/img/login/login-top-left-cloud.webp"
          alt=""
          className="absolute top-0 left-0 w-[294px] h-[129px] object-contain pointer-events-none select-none"
          draggable={false}
        />
        <img
          src="/img/login/login-top-right-tree.webp"
          alt=""
          className="absolute top-0 right-0 w-[270px] h-[275px] object-contain pointer-events-none select-none"
          draggable={false}
        />
        <img
          src="/img/login/login-bottom-left-hill-tree.webp"
          alt=""
          className="absolute bottom-0 left-0 w-[382px] h-[329px] object-contain pointer-events-none select-none"
          draggable={false}
        />
        <img
          src="/img/login/login-bottom-right-bush.webp"
          alt=""
          className="absolute bottom-0 right-0 w-[167px] h-[227px] object-contain pointer-events-none select-none"
          draggable={false}
        />

        {/* Carousel H2 — centered marketing copy. Kept static (no
            auto-rotation needed for this build, per brief: "use one
            of the WebPs as the background"). The 4 slide texts from
            spec §12 are summarized into one centered tagline. */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-12">
          <div className="max-w-[480px] text-center">
            <h2
              className="m-0 text-white"
              style={{
                fontFamily:
                  "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
                fontSize: "32px",
                fontWeight: 400,
                lineHeight: "40px",
                letterSpacing: "-0.01em",
              }}
            >
              Run an entire accessible desktop with AI
            </h2>
            <p
              className="m-0 mt-4 text-white"
              style={{
                fontFamily:
                  "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "24px",
                opacity: 0.85,
              }}
            >
              Spirit OS is an accessible, AI-powered desktop operating system designed to run entirely in the browser.
            </p>
          </div>
        </div>

        {/* Carousel pagination dots (decorative) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block rounded-full"
              style={{
                width: 10,
                height: 10,
                background:
                  i === 0 ? "#f1f1ee" : "rgba(32,32,32,0.2)",
              }}
            />
          ))}
        </div>
      </section>

      {/* ===========================================================
          RIGHT — auth card + minimal copyright footer
          =========================================================== */}
      <div className="flex flex-col w-full min-[1000px]:w-[460px] min-[1000px]:flex-none min-[1000px]:justify-center">
        <AuthCard />

        {/* Minimal copyright-only footer */}
        <footer
          className="px-4 pb-8 text-center"
          style={{
            fontFamily:
              "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            lineHeight: "18px",
            color: "rgba(32,32,32,0.5)",
          }}
        >
          © 2026 Team Spirit
        </footer>
      </div>
    </div>
  );
}

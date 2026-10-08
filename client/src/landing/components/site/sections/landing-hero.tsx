
import { LightSurfaceButton, GlassPillButton } from "../../../components/site/primitives";

export function LandingHero() {
  return (
    <div
      id="site-hero"
      className="relative w-full pixel-bg-hero pb-[69px]"
      style={{ "--hero-min-height": "620px" } as React.CSSProperties}
    >
      {/* Video background layer */}
      <div className="relative w-full h-screen min-h-[720px] md:min-h-[620px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero/cofounder-2-hero-poster.webp"
          className="absolute right-0 top-0 h-full min-w-full max-w-none object-cover object-right sm:translate-x-0 translate-x-[50%]"
        >
          <source src="/hero/cofounder-2-hero.webm" type="video/webm" />
          <source src="/hero/cofounder-2-hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Hero notifications marquee — hidden below 1120px */}
      <div
        className="absolute top-[max(15dvh,92px)] right-[40px] max-[1120px]:hidden flex flex-col items-end gap-[10px]"
        style={{ zIndex: 5 }}
      >
        {[
          { title: "Voice command", subtitle: "Open File Explorer", color: "#34a853" },
          { title: "Gesture detected", subtitle: "Pinch to click", color: "#34a853" },
          { title: "Eye tracking", subtitle: "Cursor moved", color: "#34a853" },
          { title: "Reminder", subtitle: "5:00 PM — medication", color: "#ffd93d" },
        ].map((n, i) => (
          <div
            key={i}
            className="hero-stagger flex items-center gap-[10px] rounded-[10px] px-[14px] py-[10px]"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.18)",
              animationDelay: `${0.4 + i * 0.15}s`,
              transform: `translateY(${i * -4}px) translateX(${i * -8}px) scale(${1 - i * 0.04})`,
            }}
          >
            <span
              className="w-[8px] h-[8px] rounded-full"
              style={{ background: n.color }}
            />
            <div className="flex flex-col">
              <span
                className="text-[11px] font-[460] tracking-[0.1px] text-white"
                style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                {n.title}
              </span>
              <span className="text-[12px] font-[460] text-[rgba(255,255,255,0.85)]">
                {n.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Text content layer */}
      <div className="absolute inset-0 flex justify-center items-start pt-[max(15dvh,92px)] max-[500px]:pt-[calc(75px+91px)]">
        <div className="w-full max-w-[1440px] mx-auto px-[20px] min-[476px]:px-[32px] md:px-[20px]">
          <div className="max-w-[720px]">
            <h1
              className="m-0 font-normal text-white text-left max-w-[20ch] xl:max-w-[580px] text-[46px] leading-[108%] max-[900px]:text-[38px] max-[500px]:text-[34px] max-[500px]:leading-[110%]"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.18)" }}
            >
              <span className="hero-stagger" style={{ ["--stagger" as string]: 0 }}>
                Spirit OS lets you run an entire accessible desktop with AI
              </span>
            </h1>
            <p
              className="hero-stagger mt-5 max-w-[540px] pl-[2px] text-left text-[16px] font-[460] leading-[140%] tracking-[0.15px] text-[rgba(255,255,255,0.95)] max-[500px]:mt-4"
              style={{
                textShadow: "0 1px 6px rgba(0,0,0,0.22)",
                ["--stagger" as string]: 1,
              }}
            >
              Start with voice, then hand off gestures, eye tracking, sign language, and an AI assistant that can execute real OS-level actions.
            </p>
            <div
              className="hero-stagger mt-6 flex flex-wrap items-center gap-3 max-[500px]:mt-5"
              style={{ ["--stagger" as string]: 2 }}
            >
              <LightSurfaceButton href="/app">
                Launch Spirit OS
              </LightSurfaceButton>
              <GlassPillButton href="#section-2-start">
                See it in action
              </GlassPillButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

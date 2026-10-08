
import { Reveal } from "../../../components/site/primitives";

export function DashboardMockup() {
  return (
    <div
      className="w-full rounded-[12px] overflow-hidden bg-[#fbfbf8] border border-[#dee2de]"
      style={{
        boxShadow:
          "0 2px 3px rgba(0,0,0,0.06), inset 0 0 0.357px 1.5px rgba(255,255,255,0.35), inset 0 2px 0 #fff, 0 24px 60px rgba(0,0,0,0.10)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-[16px] h-[44px] border-b border-[#dee2de]"
        style={{ background: "#f5f5f2" }}
      >
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-[530] text-[#fbfbf8]"
            style={{ background: "#1a6fd1" }}
          >
            OS
          </div>
          <span className="text-[12px] font-[460] text-[rgba(38,35,35,0.85)]">
            spirit-os/local-user
          </span>
          <span
            className="text-[11px] text-[rgba(38,35,35,0.5)]"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            Spirit OS...
          </span>
        </div>
        <div
          className="inline-flex items-center gap-[6px] h-[22px] px-[8px] rounded-[11px] text-[10px] text-[rgba(32,32,32,0.6)]"
          style={{
            background: "rgba(32,32,32,0.05)",
            fontFamily: "var(--font-ibm-plex-mono)",
          }}
        >
          AI 60%
        </div>
      </div>

      {/* Body: sidebar + main */}
      <div className="flex" style={{ minHeight: "320px" }}>
        {/* Sidebar */}
        <aside
          className="hidden sm:flex flex-col gap-[14px] p-[16px] border-r border-[#dee2de] w-[140px] shrink-0"
          style={{ background: "#f5f5f2" }}
        >
          {[
            "Files",
            "Voice",
            "Gesture",
            "Eye",
            "Sign",
            "Face",
            "AI",
            "Vault",
          ].map((d, i) => (
            <div
              key={d}
              className="flex items-center gap-[8px] text-[11px] text-[rgba(38,35,35,0.7)]"
              style={{ animation: `0.6s ease-out ${0.6 + i * 0.05}s both badge-enter` }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: i === 6 ? "#34a853" : "rgba(38,35,35,0.3)" }}
              />
              {d}
            </div>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 p-[16px] sm:p-[20px] flex flex-col gap-[14px]">
          {/* Breadcrumb */}
          <div
            className="text-[11px] text-[rgba(38,35,35,0.5)]"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            Home / Desktop / Spirit OS / Tasks / Library
          </div>

          {/* Prompt input */}
          <div
            className="h-[40px] px-[14px] flex items-center rounded-[8px] text-[13px] text-[rgba(38,35,35,0.5)]"
            style={{
              background: "#f5f5f2",
              border: "1px solid #dee2de",
            }}
          >
            Ask Spirit OS to open an app, set a reminder, or run a command…
          </div>

          {/* Agent chat thread */}
          <div className="flex flex-col gap-[10px]">
            <AgentMessage
              label="Voice agent"
              avatarLetter="V"
              text="I heard you say 'open the file explorer' — opening it now. Want me to also read your latest note aloud?"
              avatar="#1a6fd1"
            />
            <AgentMessage
              label="Iris AI"
              avatarLetter="I"
              text="Done. I've set a recurring reminder for 5:00 PM daily for medication. I'll speak it aloud when the time comes, and you can dismiss it with a gesture."
              avatar="#34a853"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentMessage({
  label,
  avatarLetter,
  text,
  avatar,
}: {
  label: string;
  avatarLetter: string;
  text: string;
  avatar: string;
}) {
  return (
    <div
      className="flex items-start gap-[10px] p-[12px] rounded-[8px]"
      style={{
        background: "#f5f5f2",
        border: "1px solid #dee2de",
        animation: "0.6s ease-out forwards orch-section-fade-in",
      }}
    >
      <div
        className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-[530] text-white shrink-0"
        style={{ background: avatar }}
      >
        {avatarLetter}
      </div>
      <div className="flex flex-col gap-[4px] min-w-0">
        <span className="text-[11px] font-[460] text-[rgba(38,35,35,0.85)]">{label}</span>
        <span className="text-[11px] leading-[160%] text-[rgba(38,35,35,0.7)]">{text}</span>
      </div>
    </div>
  );
}

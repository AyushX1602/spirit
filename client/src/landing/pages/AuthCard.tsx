"use client";

import { useState } from "react";

/* ============================================================
   Auth Card — client component (Sign In / Sign Up tab toggle).
   Spec-08-login.md §2–§13, with email/password + submit button
   + bottom toggle link per the BUILD-4 brief.

   - Width 384 px desktop / 352 px mobile (within 390 viewport).
   - "Cofounder" wordmark in departure-mono 18px (desktop only,
     per brief).
   - Toggle pill: 2 buttons, no active background — only text
     color changes (0.4 → 0.9 alpha) per spec §10.
   - Heading: "Welcome back" (Sign In) / "Create your account"
     (Sign Up) — toggles with tab.
   - Subhead: "Let's build your company." (always).
   - OAuth buttons in order: Google, GitHub, school email.
   - "OR" divider (uppercase via CSS).
   - (Sign Up only) Email + password fields — UI only.
   - Primary submit: "Sign in" / "Create account".
   - Bottom link: "Already have an account? Sign in" /
     "Don't have an account? Sign up" — toggles tab.
   - Trust microcopy (Privacy Policy, Terms of Service).
   ============================================================ */

type Mode = "signin" | "signup";

const GOOGLE_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    viewBox="0 0 48 48"
    aria-hidden="true"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002l6.19 5.238C39.718 36.054 44 30.606 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

const GITHUB_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const ENVELOPE_ICON = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 256 256"
    className="h-5 w-5 shrink-0"
    aria-hidden="true"
  >
    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
  </svg>
);

export function AuthCard() {
  const [mode, setMode] = useState<Mode>("signup");

  const isSignup = mode === "signup";

  return (
    <div
      className="flex flex-col items-center w-full min-h-screen max-md:px-4 max-md:pt-8 max-md:pb-12 min-[1000px]:w-[384px] min-[1000px]:px-0 min-[1000px]:pt-0 min-[1000px]:pb-[112px] min-[1000px]:min-h-0 min-[1000px]:justify-center"
      style={{ background: "transparent" }}
    >
      <h1
        className="hidden min-[1000px]:block mb-4 text-foreground"
        style={{
          fontFamily:
            "var(--font-departure-mono), 'Departure Mono', monospace",
          fontSize: "18px",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        spirit os
      </h1>

      {/* Subhead — always shown */}
      <p
        className="m-0 text-center mb-5"
        style={{
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
          fontSize: "18px",
          fontWeight: 500,
          lineHeight: "28px",
          color: "rgba(32,32,32,0.5)",
        }}
      >
        Let&apos;s launch your desktop.
      </p>

      {/* Toggle pill */}
      <fieldset
        className="mb-5 grid w-fit grid-cols-2 gap-1 rounded-full p-[3px]"
        role="group"
        aria-label="Authentication mode"
        style={{
          background: "#f5f5f2",
          boxShadow:
            "inset 0 0 0 1px rgba(32,32,32,0.05), inset 0 -1px 1px rgba(255,255,255,1), inset 0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <ToggleBtn active={!isSignup} onClick={() => setMode("signin")}>
          Sign In
        </ToggleBtn>
        <ToggleBtn active={isSignup} onClick={() => setMode("signup")}>
          Sign Up
        </ToggleBtn>
      </fieldset>

      {/* Heading */}
      <h2
        className="m-0 mb-6 text-center"
        style={{
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
          fontSize: "24px",
          fontWeight: 500,
          lineHeight: "32px",
          color: "#202020",
        }}
      >
        {isSignup ? "Create your account" : "Welcome back"}
      </h2>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 w-full max-w-[384px]">
        <OAuthButton
          icon={GOOGLE_ICON}
          label={isSignup ? "Sign up with Google" : "Sign in with Google"}
        />
        <OAuthButton
          icon={GITHUB_ICON}
          label={isSignup ? "Sign up with GitHub" : "Sign in with GitHub"}
        />
        <SchoolEmailButton />
      </div>

      {/* OR divider */}
      <div className="mb-5 mt-5 flex items-center gap-3 w-full max-w-[384px]" aria-hidden="true">
        <div className="h-px flex-1" style={{ background: "rgba(32,32,32,0.1)" }} />
        <span
          className="text-xs font-medium uppercase tracking-normal"
          style={{
            fontFamily:
              "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(32,32,32,0.5)",
          }}
        >
          Or
        </span>
        <div className="h-px flex-1" style={{ background: "rgba(32,32,32,0.1)" }} />
      </div>

      {/* Email + password (Sign Up only) — UI only, non-functional */}
      {isSignup && (
        <form
          className="flex flex-col gap-3 w-full max-w-[384px] mb-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <FieldLabel htmlFor="email" label="Email" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            className="w-full h-[52px] rounded-full px-6 text-[16px] font-medium outline-none transition-colors"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(32,32,32,0.12)",
              color: "#202020",
              fontFamily:
                "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
            }}
          />
          <FieldLabel htmlFor="password" label="Password" />
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-[52px] rounded-full px-6 text-[16px] font-medium outline-none transition-colors"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(32,32,32,0.12)",
              color: "#202020",
              fontFamily:
                "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
            }}
          />
        </form>
      )}

      {/* Primary submit button */}
      <button
        type="button"
        className="inline-flex h-[52px] w-full max-w-[384px] items-center justify-center gap-2 rounded-full text-white text-[16px] font-medium transition duration-200 hover:opacity-90 hover:brightness-105"
        style={{
          background: "linear-gradient(to top, #0f0f0f, #262626)",
          border: "2px solid #4f4f4f",
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
        }}
      >
        {isSignup ? "Create account" : "Sign in"}
      </button>

      {/* Bottom toggle link */}
      <p
        className="m-0 mt-6 text-center"
        style={{
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(32,32,32,0.7)",
        }}
      >
        {isSignup ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="underline transition-colors hover:text-[#202020]"
              style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="underline transition-colors hover:text-[#202020]"
              style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
            >
              Sign up
            </button>
          </>
        )}
      </p>

      {/* Trust microcopy */}
      <div
        className="mt-8 text-center px-4 font-medium"
        style={{
          fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          color: "rgba(32,32,32,0.5)",
        }}
      >
        <p className="m-0">By continuing you agree to our</p>
        <p className="m-0">
          <a
            to="/privacy-policy"
            className="underline transition-colors hover:text-[#202020]"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            to="/terms"
            className="underline transition-colors hover:text-[#202020]"
          >
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="relative inline-flex h-[22px] w-[7rem] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0 text-[12px] font-medium leading-none tracking-[0.12px] outline-none transition-colors"
      style={{
        background: "transparent",
        color: active ? "rgba(32,32,32,0.9)" : "rgba(32,32,32,0.4)",
        fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function OAuthButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-white text-[16px] font-medium transition duration-200 hover:opacity-90 hover:brightness-105"
      style={{
        background: "linear-gradient(to top, #0f0f0f, #262626)",
        border: "2px solid #4f4f4f",
        fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SchoolEmailButton() {
  return (
    <a
      to="/edu"
      className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-medium transition duration-200 hover:opacity-90 hover:brightness-105"
      style={{
        background:
          "linear-gradient(rgb(79,79,79) 23.86%, rgb(62,62,62) 100%)",
        border: "1px solid rgba(0,0,0,0.5)",
        color: "rgba(255,255,255,0.7)",
        fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      {ENVELOPE_ICON}
      Continue with school email
    </a>
  );
}

function FieldLabel({
  htmlFor,
  label,
}: {
  htmlFor: string;
  label: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="m-0 mb-1"
      style={{
        fontFamily: "var(--font-neoris), 'TT Neoris', system-ui, sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        color: "rgba(32,32,32,0.7)",
        lineHeight: "20px",
      }}
    >
      {label}
    </label>
  );
}

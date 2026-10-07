"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "./Toast";

const CAROUSEL = [
  {
    title: "Collect responses",
    line: "Build with AI and turn responses into customers",
  },
  {
    title: "Manage your audience",
    line: "Enrich and segment contacts automatically",
  },
  {
    title: "Automate workflows",
    line: "Use AI to spot patterns and trigger follow-ups",
  },
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M13 1h10v10H13z" />
      <path fill="#7fba00" d="M1 13h10v10H1z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [slide, setSlide] = useState(0);

  const notAvailable = () => showToast("Not available");

  const goHome = () => router.push("/");

  const prevSlide = () =>
    setSlide((s) => (s === 0 ? CAROUSEL.length - 1 : s - 1));
  const nextSlide = () =>
    setSlide((s) => (s === CAROUSEL.length - 1 ? 0 : s + 1));

  return (
    <div
      className="login-shell flex min-h-screen flex-col"
      style={
        {
          "--login-bg": "#ffffff",
          "--login-card": "#fafafa",
          "--login-fg": "#111111",
          "--login-muted": "#6f6e6e",
          "--login-border": "#e2e2e2",
          "--login-primary": "#3c323e",
          "--login-primary-fg": "#ffffff",
          "--login-radius": "12px",
        } as React.CSSProperties
      }
    >
      <header
        className="flex h-14 items-center justify-between px-6"
        style={{
          background: "var(--login-bg)",
          color: "var(--login-fg)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-semibold tracking-tight"
        >
          <span className="flex gap-0.5" aria-hidden>
            <span
              className="h-4 w-1 rounded-sm"
              style={{ background: "var(--login-fg)" }}
            />
            <span
              className="h-4 w-4 rounded-sm"
              style={{ background: "var(--login-fg)" }}
            />
          </span>
          Forms
        </Link>
        <div className="flex items-center gap-8">
          <div
            className="hidden items-center gap-1 text-sm sm:flex"
            style={{ color: "var(--login-muted)" }}
          >
            <span style={{ color: "var(--login-fg)" }}>Have a question?</span>
            <button
              type="button"
              className="underline underline-offset-2"
              style={{ color: "var(--login-fg)" }}
              onClick={notAvailable}
            >
              Contact us
            </button>
          </div>
          <button
            type="button"
            className="flex h-8 items-center gap-2 rounded-md border px-3 text-sm"
            style={{
              borderColor: "var(--login-border)",
              color: "var(--login-muted)",
            }}
          >
            <GlobeIcon />
            <span style={{ color: "var(--login-fg)" }}>English</span>
            <ChevronDown />
          </button>
        </div>
      </header>

      <section
        className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
        style={{ background: "var(--login-card)", color: "var(--login-fg)" }}
      >
        <div
          className="flex flex-1 items-center justify-center border-b px-6 py-12 lg:border-b-0 lg:border-r"
          style={{ borderColor: "color-mix(in srgb, var(--login-border) 40%, transparent)" }}
        >
          <div className="w-full max-w-[400px]">
            <div className="mb-12">
              <h1 className="text-2xl font-medium tracking-tight">Log in</h1>
              <p
                className="mt-2 max-w-[380px] text-base leading-5"
                style={{ color: "var(--login-fg)" }}
              >
                Build forms, gather responses, and automate your workflows.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                goHome();
              }}
            >
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border text-base shadow-sm"
                style={{
                  borderColor: "var(--login-border)",
                  background: "var(--login-card)",
                  color: "var(--login-fg)",
                }}
                onClick={notAvailable}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border text-base shadow-sm"
                style={{
                  borderColor: "var(--login-border)",
                  background: "var(--login-card)",
                  color: "var(--login-fg)",
                }}
                onClick={notAvailable}
              >
                <MicrosoftIcon />
                Continue with Microsoft
              </button>

              <div className="pt-1">
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-base"
                  style={{ color: "var(--login-fg)" }}
                >
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="h-11 w-full rounded-xl border px-3 outline-none"
                  style={{
                    borderColor: "var(--login-border)",
                    background: "var(--login-card)",
                    color: "var(--login-fg)",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl text-base"
                style={{
                  background: "var(--login-primary)",
                  color: "var(--login-primary-fg)",
                }}
              >
                Continue with email
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  className="text-sm underline underline-offset-2"
                  style={{ color: "var(--login-fg)" }}
                  onClick={notAvailable}
                >
                  Log in with SSO
                </button>
              </div>

              <div
                className="border-t pt-7 text-center text-sm"
                style={{
                  borderColor: "var(--login-border)",
                  color: "var(--login-fg)",
                }}
              >
                Don&apos;t have an account?
                <Link
                  href="/"
                  className="ml-1 underline underline-offset-2"
                  style={{ color: "var(--login-fg)" }}
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col items-center px-6 pb-12 pt-16 text-white lg:pt-[181px]"
          style={{ background: "#111111" }}
        >
          <div className="w-full max-w-[490px] text-center text-xl font-medium leading-7">
            Continue exploring powerful features that make data collection
            effortless
          </div>

          <div className="mt-10 w-full max-w-[520px]">
            <div
              className="overflow-hidden rounded-2xl border px-7 pb-6 pt-5 text-center"
              style={{
                borderColor: "rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-base font-medium">
                {CAROUSEL[slide].title}
              </div>
              <div className="mt-1 text-sm opacity-90">{CAROUSEL[slide].line}</div>
              <div
                className="mx-auto mt-6 h-[180px] w-full max-w-[400px] rounded-lg"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                }}
                aria-hidden
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-5">
              <button
                type="button"
                aria-label="Previous slide"
                className="flex h-5 w-5 items-center justify-center opacity-80 hover:opacity-100"
                onClick={prevSlide}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                {CAROUSEL.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={i === slide ? "Current item" : `Go to item ${i + 1}`}
                    className="flex h-3 w-3 items-center justify-center"
                    onClick={() => setSlide(i)}
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          i === slide
                            ? "rgba(255,255,255,1)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Next slide"
                className="flex h-5 w-5 items-center justify-center opacity-35 hover:opacity-60"
                onClick={nextSlide}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "scaler_small_screen_warning_dismissed";

export function SmallScreenWarning() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    if (window.innerWidth >= 1024) return;
    setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-8 shadow-xl"
        role="dialog"
        aria-labelledby="small-screen-title"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-[var(--muted)]"
          aria-label="Close"
          onClick={dismiss}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <h2 id="small-screen-title" className="pr-8 text-xl font-semibold text-[var(--label)]">
          Typeform is better on a bigger screen
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          You&apos;re using Typeform on a small screen. This limits the features you can use,
          and makes it harder to navigate forms. For the best experience, we recommend logging
          in from a device like a laptop or desktop computer with a larger screen.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "#2a222b" }}
            onClick={dismiss}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

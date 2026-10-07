"use client";

import { useToast } from "./Toast";

export function FixedAskAiDock() {
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-30 w-[256px]">
      <div className="pointer-events-auto">
        <AskAiDock />
      </div>
    </div>
  );
}

export function AskAiDock() {
  const { showToast } = useToast();

  const unavailable = () => showToast("Not available");

  return (
    <div className="border-t border-transparent p-3">
      <div
        className="rounded-full p-[3px]"
        style={{ background: "#e6d9f5" }}
      >
        <div className="flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3 py-2.5 shadow-sm">
          <button
            type="button"
            className="shrink-0 text-[#5e5e5e]"
            aria-label="Microphone"
            onClick={unavailable}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <span className="h-5 w-px shrink-0 bg-[#e0e0e0]" aria-hidden />
          <input
            type="text"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[#737373]"
            placeholder="Ask Typeform AI"
            onFocus={unavailable}
          />
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#e0e0e0] bg-[#f5f5f5] text-[#9ca3af]"
            aria-label="Send"
            onClick={unavailable}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M3 12l18-8-8 18-2-8-8-2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

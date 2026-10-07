"use client";

/** Bottom-center status toast, visible for 3 seconds. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--label)] shadow-md"
        >
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

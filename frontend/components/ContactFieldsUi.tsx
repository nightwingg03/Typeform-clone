"use client";

import type { ContactInfoConfig } from "@/lib/types";
import { PEARL_INK, PEARL_LINE, PEARL_PLACEHOLDER } from "@/lib/pearlWhite";

export function UsFlagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 20 14"
      aria-hidden
    >
      <rect width="20" height="14" fill="#B22234" />
      <path
        fill="#fff"
        d="M0 1.08h20M0 2.8h20M0 4.52h20M0 6.24h20M0 7.96h20M0 9.68h20M0 11.4h20"
      />
      <rect width="8" height="7.7" fill="#3C3B6E" />
    </svg>
  );
}

const FIELD_META = [
  { key: "first_name" as const, label: "First name", phKey: "first_name_placeholder" as const },
  { key: "last_name" as const, label: "Last name", phKey: "last_name_placeholder" as const },
  { key: "phone" as const, label: "Phone number", phKey: "phone_placeholder" as const, phone: true },
  { key: "email" as const, label: "Email", phKey: "email_placeholder" as const },
  { key: "company" as const, label: "Company", phKey: "company_placeholder" as const },
];

export function ContactFieldsPreview({
  config,
}: {
  config: ContactInfoConfig;
}) {
  return (
    <div className="mt-8 flex flex-col gap-6">
      {FIELD_META.map((field) => (
        <div key={field.key}>
          <p className="text-sm font-medium" style={{ color: PEARL_INK }}>
            {field.label}
          </p>
          {field.phone ? (
            <div
              className="editor-gray-box mt-2 flex items-center gap-2 px-3 py-2"
              style={{ borderColor: PEARL_LINE }}
            >
              <span className="flex items-center gap-1 border-r pr-2" style={{ borderColor: PEARL_LINE }}>
                <UsFlagIcon />
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke={PEARL_PLACEHOLDER}
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span className="text-lg" style={{ color: PEARL_PLACEHOLDER }}>
                {config[field.phKey] || "(201) 555-0123"}
              </span>
            </div>
          ) : (
            <p
              className="editor-gray-box mt-2 px-2 pb-2 pt-1 text-lg"
              style={{ borderColor: PEARL_LINE, color: PEARL_PLACEHOLDER }}
            >
              {config[field.phKey] || "…"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export type ContactFieldKey = "first_name" | "last_name" | "phone" | "email" | "company";

export function ContactFieldsFill({
  config,
  values,
  onChange,
  onPhoneCountryClick,
}: {
  config: ContactInfoConfig;
  values: Record<ContactFieldKey, string>;
  onChange: (key: ContactFieldKey, value: string) => void;
  onPhoneCountryClick?: () => void;
}) {
  return (
    <div className="mt-11 flex flex-col gap-6">
      {FIELD_META.map((field) => (
        <div key={field.key}>
          <label className="text-sm font-medium" style={{ color: PEARL_INK }}>
            {field.label}
          </label>
          {field.phone ? (
            <div
              className="mt-2 flex items-center gap-2 rounded-md border px-3"
              style={{ borderColor: PEARL_LINE }}
            >
              <button
                type="button"
                className="flex shrink-0 items-center gap-1 border-r py-3 pr-2"
                style={{ borderColor: PEARL_LINE }}
                onClick={onPhoneCountryClick}
              >
                <UsFlagIcon />
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 9l6 6 6-6"
                    stroke={PEARL_PLACEHOLDER}
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-lg outline-none"
                style={{ color: PEARL_INK }}
                placeholder={config.phone_placeholder || "(201) 555-0123"}
                aria-label={field.label}
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
          ) : (
            <input
              className="mt-2 block w-full border-0 border-b bg-transparent pb-2 text-lg outline-none"
              style={{ borderColor: PEARL_LINE, color: PEARL_INK }}
              type={field.key === "email" ? "email" : "text"}
              placeholder={config[field.phKey]}
              aria-label={field.label}
              value={values[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ContactSubRowIcon({ variant }: { variant: "group" | "lines" | "phone" | "mail" | "building" }) {
  const bg =
    variant === "phone"
      ? "#f5d0d6"
      : variant === "mail"
        ? "#f5d0d6"
        : "#e8e8e8";
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded"
      style={{ background: bg }}
    >
      {variant === "group" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h10" stroke="#444" strokeWidth="2" />
        </svg>
      ) : variant === "lines" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 8h16M4 16h10" stroke="#444" strokeWidth="2" />
        </svg>
      ) : variant === "phone" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 4h4l2 4-2 1a11 11 0 0 0 5 5l1-2 4 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"
            stroke="#c44"
            strokeWidth="1.5"
          />
        </svg>
      ) : variant === "mail" ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="6" width="18" height="12" rx="1" stroke="#c44" strokeWidth="1.5" />
          <path d="M3 8l9 6 9-6" stroke="#c44" strokeWidth="1.5" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 20V8l8-4 8 4v12H4z" stroke="#444" strokeWidth="1.5" />
        </svg>
      )}
    </span>
  );
}

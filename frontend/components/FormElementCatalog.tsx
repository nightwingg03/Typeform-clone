"use client";

import { useMemo, useState } from "react";

import type { QuestionType } from "@/lib/types";

export const CHIP = {
  pink: { bg: "#fce4ec", stroke: "#c2185b" },
  purple: { bg: "#e8eaf6", stroke: "#5e35b1" },
  green: { bg: "#e8f5e9", stroke: "#2e7d32" },
  blue: { bg: "#e3f2fd", stroke: "#1565c0" },
  yellow: { bg: "#fff8e1", stroke: "#f9a825" },
  gray: { bg: "#eeeeee", stroke: "#616161" },
  orange: { bg: "#fff3e0", stroke: "#e65100" },
} as const;

export type ChipTone = keyof typeof CHIP;

export function PremiumDiamond() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path d="M12 3l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z" fill="#006b5e" />
    </svg>
  );
}

function IconInChip({
  tone,
  children,
}: {
  tone: ChipTone;
  children: React.ReactNode;
}) {
  const c = CHIP[tone];
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
      style={{ background: c.bg, color: c.stroke }}
    >
      {children}
    </span>
  );
}

export function CatalogIcon({ id }: { id: string }) {
  const s = (d: React.ReactNode) => d;
  switch (id) {
    case "contact_info":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 20c0-4 3-6 7-6s7 2 7 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "email":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "phone":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 4h4l2 4-2 1a11 11 0 0 0 5 5l1-2 4 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>,
      );
    case "address":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "website":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "multiple_choice":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 7h12M6 12h12M6 17h8" stroke="currentColor" strokeWidth="1.5" />
          <text x="4" y="9" fontSize="6" fill="currentColor">A</text>
        </svg>,
      );
    case "dropdown":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
        </svg>,
      );
    case "picture_choice":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" />
          <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "yes_no":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "legal":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 3v18M8 7h8M7 21h10" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "checkbox":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "nps":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 18h16M6 16V8a6 6 0 0 1 12 0v8" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "opinion_scale":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 18V6M8 18V10M12 18V8M16 18V12M20 18V4" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "rating":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 4l2.5 5 5.5.8-4 3.9 1 5.5L12 16l-5.5 3.2 1-5.5-4-3.9 5.5-.8L12 4z" stroke="currentColor" strokeWidth="1.2" />
        </svg>,
      );
    case "ranking":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "matrix":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={6 + (i % 3) * 6} cy={6 + Math.floor(i / 3) * 6} r="1.5" fill="currentColor" />
          ))}
        </svg>,
      );
    case "long_text":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "short_text":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "video":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 10l4-2v8l-4-2" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "clarify_ai":
    case "faq_ai":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 8h16M4 12h12M4 16h8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" />
        </svg>,
      );
    case "number":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 6h8M6 12h12M8 18h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "date":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "signature":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 16c3-4 6-4 9 0s6 4 9 0" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "payment":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "file_upload":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 18h16v2H4z" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "scheduler":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "welcome":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 20h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "partial_submit":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 12l18-6-6 18-3-9-9-3z" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "statement":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 6h8M6 10h12M8 14h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "question_group":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="7" y="9" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "end_screen":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 4H5a2 2 0 0 0-2 2v12h2M15 4h4v16h-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "redirect":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 4h6v6M10 14L20 4M5 20h6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
    case "hubspot":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#e65100" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="#e65100" />
        </svg>,
      );
    case "salesforce":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 14c2-3 4-4 6-2s4 1 6-2" stroke="#039be5" strokeWidth="2" />
        </svg>,
      );
    case "browse_apps":
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="6" r="2" fill="currentColor" />
          <circle cx="12" cy="6" r="2" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
        </svg>,
      );
    default:
      return s(
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>,
      );
  }
}

export function QuestionTypeChip({
  type,
  stepNumber,
}: {
  type: QuestionType;
  stepNumber: number;
}) {
  const map: Record<QuestionType, { icon: string; tone: ChipTone }> = {
    contact_info: { icon: "contact_info", tone: "pink" },
    email: { icon: "email", tone: "pink" },
    multiple_choice: { icon: "multiple_choice", tone: "purple" },
    dropdown: { icon: "dropdown", tone: "purple" },
    yes_no: { icon: "yes_no", tone: "purple" },
    rating: { icon: "rating", tone: "green" },
    short_text: { icon: "short_text", tone: "blue" },
    long_text: { icon: "long_text", tone: "blue" },
    number: { icon: "number", tone: "yellow" },
  };
  const { icon, tone } = map[type];
  return (
    <span className="inline-flex items-center gap-1">
      <IconInChip tone={tone}>
        <CatalogIcon id={icon} />
      </IconInChip>
      <span className="text-[10px] font-medium text-[var(--muted)]">{stepNumber}</span>
    </span>
  );
}

type CatalogItem = {
  id: string;
  label: string;
  tone: ChipTone;
  premium?: boolean;
  questionType?: QuestionType;
};

const CATALOG_GROUPS: { title: string; items: CatalogItem[] }[] = [
  {
    title: "Contact info",
    items: [
      { id: "contact_info", label: "Contact Info", tone: "pink", questionType: "contact_info" },
      { id: "email", label: "Email", tone: "pink", questionType: "email" },
      { id: "phone", label: "Phone Number", tone: "pink" },
      { id: "address", label: "Address", tone: "pink" },
      { id: "website", label: "Website", tone: "pink" },
    ],
  },
  {
    title: "Choice",
    items: [
      { id: "multiple_choice", label: "Multiple Choice", tone: "purple", questionType: "multiple_choice" },
      { id: "dropdown", label: "Dropdown", tone: "purple", questionType: "dropdown" },
      { id: "picture_choice", label: "Picture Choice", tone: "purple" },
      { id: "yes_no", label: "Yes/No", tone: "purple", questionType: "yes_no" },
      { id: "legal", label: "Legal", tone: "purple" },
      { id: "checkbox", label: "Checkbox", tone: "purple" },
    ],
  },
  {
    title: "Rating & ranking",
    items: [
      { id: "nps", label: "Net Promoter Score®", tone: "green" },
      { id: "opinion_scale", label: "Opinion Scale", tone: "green" },
      { id: "rating", label: "Rating", tone: "green", questionType: "rating" },
      { id: "ranking", label: "Ranking", tone: "green" },
      { id: "matrix", label: "Matrix", tone: "green" },
    ],
  },
  {
    title: "Text & Video",
    items: [
      { id: "long_text", label: "Long Text", tone: "blue", questionType: "long_text" },
      { id: "short_text", label: "Short Text", tone: "blue", questionType: "short_text" },
      { id: "video", label: "Video and Audio", tone: "blue", premium: true },
      { id: "clarify_ai", label: "Clarify with AI", tone: "blue", premium: true },
      { id: "faq_ai", label: "FAQ with AI", tone: "blue", premium: true },
    ],
  },
  {
    title: "Other",
    items: [
      { id: "number", label: "Number", tone: "yellow", questionType: "number" },
      { id: "date", label: "Date", tone: "yellow" },
      { id: "signature", label: "Signature", tone: "yellow", premium: true },
      { id: "payment", label: "Payment", tone: "yellow", premium: true },
      { id: "file_upload", label: "File Upload", tone: "yellow", premium: true },
      { id: "scheduler", label: "Scheduler", tone: "yellow", premium: true },
      { id: "welcome", label: "Welcome Screen", tone: "gray" },
      { id: "partial_submit", label: "Partial Submit Point", tone: "gray", premium: true },
      { id: "statement", label: "Statement", tone: "gray" },
      { id: "question_group", label: "Question Group", tone: "gray" },
      { id: "end_screen", label: "End Screen", tone: "gray" },
      { id: "redirect", label: "Redirect to URL", tone: "gray", premium: true },
    ],
  },
];

const RECOMMENDED: CatalogItem[] = [
  { id: "video", label: "Video and Audio", tone: "blue", premium: true },
  { id: "short_text", label: "Short Text", tone: "blue", questionType: "short_text" },
  { id: "multiple_choice", label: "Multiple Choice", tone: "purple", questionType: "multiple_choice" },
];

const APPS: CatalogItem[] = [
  { id: "hubspot", label: "Hubspot", tone: "orange" },
  { id: "salesforce", label: "Salesforce", tone: "blue", premium: true },
  { id: "browse_apps", label: "Browse all apps", tone: "gray" },
];

function CatalogRow({
  item,
  onActivate,
}: {
  item: CatalogItem;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm hover:bg-[#f5f5f5]"
      onClick={onActivate}
    >
      <IconInChip tone={item.tone}>
        <CatalogIcon id={item.id} />
      </IconInChip>
      <span className="min-w-0 flex-1 truncate text-[var(--label)]">{item.label}</span>
      {item.premium ? <PremiumDiamond /> : null}
    </button>
  );
}

export function ContentPickerModal({
  onClose,
  onPick,
  onUnavailable,
}: {
  onClose: () => void;
  onPick: (type: QuestionType) => void;
  onUnavailable: () => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"add" | "import" | "ai">("add");

  const allItems = useMemo(() => {
    const items: CatalogItem[] = [...RECOMMENDED, ...APPS];
    for (const g of CATALOG_GROUPS) items.push(...g.items);
    return items;
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (item: CatalogItem) =>
    !q || item.label.toLowerCase().includes(q);

  const activate = (item: CatalogItem) => {
    if (item.questionType) {
      onPick(item.questionType);
      onClose();
    } else {
      onUnavailable();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[960px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eee] px-6 py-4">
          <div className="flex gap-6 text-sm">
            <button
              type="button"
              className={tab === "add" ? "font-semibold text-[var(--label)]" : "text-[var(--muted)]"}
              onClick={() => setTab("add")}
            >
              Add form elements
            </button>
            <button
              type="button"
              className={tab === "import" ? "font-semibold text-[var(--label)]" : "text-[var(--muted)]"}
              onClick={() => {
                setTab("import");
                onUnavailable();
              }}
            >
              Import questions
            </button>
            <button
              type="button"
              className={tab === "ai" ? "font-semibold text-[var(--label)]" : "text-[var(--muted)]"}
              onClick={() => {
                setTab("ai");
                onUnavailable();
              }}
            >
              Create with AI
            </button>
          </div>
          <button type="button" className="text-xl text-[var(--muted)]" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {tab === "add" ? (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="w-[220px] shrink-0 overflow-y-auto border-r border-[#eee] bg-[#fafafa] p-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2 pl-9 pr-3 text-sm outline-none"
                  placeholder="Search form elements"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <p className="mt-4 text-xs font-semibold text-[var(--label)]">Recommended</p>
              <div className="mt-2 space-y-1">
                {RECOMMENDED.filter(matches).map((item) => (
                  <div
                    key={`rec-${item.id}`}
                    className="rounded-lg border border-[#e8e8e8] bg-white px-2 py-1"
                  >
                    <CatalogRow item={item} onActivate={() => activate(item)} />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold text-[var(--label)]">Connect to apps</p>
              <div className="mt-2 space-y-1">
                {APPS.filter(matches).map((item) => (
                  <CatalogRow key={item.id} item={item} onActivate={() => onUnavailable()} />
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-1 overflow-y-auto p-6">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {CATALOG_GROUPS.map((group) => {
                  const items = group.items.filter(matches);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.title}>
                      <h3 className="text-sm font-semibold text-[var(--label)]">{group.title}</h3>
                      <div className="mt-2 space-y-0.5">
                        {items.map((item) => (
                          <CatalogRow key={item.id} item={item} onActivate={() => activate(item)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {q && !allItems.some(matches) ? (
                <p className="text-sm text-[var(--muted)]">No matching elements</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="p-8 text-sm text-[var(--muted)]">Switch to Add form elements to browse types.</div>
        )}
      </div>
    </div>
  );
}

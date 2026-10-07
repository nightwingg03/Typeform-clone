"use client";

import Link from "next/link";

export type FormEditorTab =
  | "content"
  | "workflow"
  | "connect"
  | "share"
  | "results";

interface FormEditorHeaderProps {
  formId: number;
  title: string;
  activeTab: FormEditorTab;
  status: "draft" | "published";
  onPublish: () => void;
  titleEditable?: boolean;
  titleDraft?: string;
  onTitleDraftChange?: (value: string) => void;
  onTitleBlur?: () => void;
  onTitleKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onHelp?: () => void;
  onPlans?: () => void;
  onProfile?: () => void;
}

export function FormEditorHeader({
  formId,
  title,
  activeTab,
  status: _status,
  onPublish,
  titleEditable,
  titleDraft,
  onTitleDraftChange,
  onTitleBlur,
  onTitleKeyDown,
  onHelp = () => {},
  onPlans = () => {},
  onProfile = () => {},
}: FormEditorHeaderProps) {
  const tabClass = (active: boolean) =>
    active
      ? "border-b-2 border-[var(--label)] pb-2 font-medium text-[var(--label)]"
      : "pb-2 text-[var(--muted)] hover:text-[var(--label)]";

  const displayTitle = titleEditable && titleDraft !== undefined ? titleDraft : title;

  return (
    <header className="border-b border-[var(--border-subtle)] bg-white">
      <div className="flex flex-nowrap items-center gap-4 overflow-x-auto px-4 py-2">
        <nav className="flex shrink-0 items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/" className="font-medium text-[var(--label)] hover:underline">
            Forms
          </Link>
          <span aria-hidden className="text-[#5e5e5e]">›</span>
          {titleEditable ? (
            <input
              className="min-w-[100px] max-w-[200px] border-0 bg-transparent text-sm font-medium text-[var(--label)] outline-none"
              value={displayTitle}
              onChange={(e) => onTitleDraftChange?.(e.target.value)}
              onBlur={() => onTitleBlur?.()}
              onKeyDown={onTitleKeyDown}
            />
          ) : (
            <span className="max-w-[200px] truncate text-sm font-medium text-[var(--label)]">
              {displayTitle}
            </span>
          )}
        </nav>
        <nav className="flex min-w-0 flex-1 shrink justify-center gap-6 whitespace-nowrap text-sm">
          <Link href={`/forms/${formId}`} className={tabClass(activeTab === "content")}>
            Content
          </Link>
          <Link
            href={`/forms/${formId}/logic`}
            className={tabClass(activeTab === "workflow")}
          >
            Workflow
          </Link>
          <Link
            href={`/forms/${formId}/connect`}
            className={tabClass(activeTab === "connect")}
          >
            Connect
          </Link>
          <Link
            href={`/forms/${formId}/share`}
            className={tabClass(activeTab === "share")}
          >
            Share
          </Link>
          <Link
            href={`/forms/${formId}/results`}
            className={tabClass(activeTab === "results")}
          >
            Results
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-sm"
            onClick={onPublish}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
            Publish edits
          </button>
          <Link
            href={`/forms/${formId}/share`}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-white"
            aria-label="Share"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>
          <button
            type="button"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white"
            style={{ background: "#006b5e" }}
            onClick={onPlans}
          >
            View plans
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)]"
            style={{ background: "#f0f0f0" }}
            aria-label="Help"
            onClick={onHelp}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ background: "#9b8ab8" }}
            onClick={onProfile}
          >
            HS
          </button>
        </div>
      </div>
    </header>
  );
}

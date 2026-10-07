"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { FormDetail } from "@/lib/types";
import { FixedAskAiDock } from "./AskAiDock";
import { FormEditorHeader } from "./FormEditorHeader";
import { useToast } from "./Toast";

interface ShareProps {
  formId: number;
}

export function Share({ formId }: ShareProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormDetail | null>(null);
  const na = () => showToast("Not available");

  const load = useCallback(async () => {
    try {
      setForm(await api.getForm(formId));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load form");
    }
  }, [formId, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePublish = async () => {
    if (!form) return;
    try {
      const updated =
        form.status === "published"
          ? await api.unpublishForm(form.id)
          : await api.publishForm(form.id);
      setForm(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Publish failed");
    }
  };

  const publicPath = form ? `/f/${form.slug}` : "";
  const publicUrl =
    typeof window !== "undefined" && form
      ? `${window.location.origin}${publicPath}`
      : publicPath;

  const copyLink = async () => {
    if (!form) return;
    if (form.status !== "published") {
      showToast("Publish the form before this link will work for respondents");
      return;
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast("Link copied");
    } catch {
      showToast("Could not copy link");
    }
  };

  if (!form) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const host =
    typeof window !== "undefined" ? window.location.host : "localhost";

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#f5f5f5]">
      <FormEditorHeader
        formId={formId}
        title={form.title}
        activeTab="share"
        status={form.status}
        onPublish={() => void togglePublish()}
        onHelp={na}
        onPlans={na}
        onProfile={na}
      />

      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
        <h1 className="text-center text-2xl font-normal text-[var(--label)]">
          Choose how you&apos;d like to share your form
        </h1>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Status:{" "}
          <span
            className={
              form.status === "published"
                ? "font-medium text-[#006b5e]"
                : "font-medium text-[var(--label)]"
            }
          >
            {form.status === "published" ? "Published" : "Draft"}
          </span>
          {form.status !== "published" ? (
            <span className="block mt-1 text-xs">
              Use Publish edits in the header to make this form live at the link below.
            </span>
          ) : null}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ background: "#2a222b" }}
            onClick={() => void copyLink()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            Copy link
          </button>
          <p className="min-w-0 flex-1 truncate text-sm text-[var(--muted)]">
            {publicUrl}
          </p>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[var(--label)]"
            onClick={na}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Edit
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded border border-[var(--border-subtle)]"
            aria-label="QR code"
            onClick={na}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--label)]">Link preview</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-[#006b5e]"
              onClick={na}
            >
              Customize
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button type="button" className="text-[var(--muted)]" aria-label="Preview" onClick={na}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-4 rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
          <div className="h-16 w-16 shrink-0 rounded bg-[#e8e8e8]" aria-hidden />
          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--label)]">{form.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Collect responses</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{host}</p>
          </div>
        </div>

        <h2 className="mt-10 text-lg font-medium text-[var(--label)]">Embed form</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            className="flex overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white text-left shadow-sm"
            onClick={na}
          >
            <div className="w-24 shrink-0 bg-[#c4b5fd]" aria-hidden />
            <p className="flex items-center p-4 text-sm font-medium">On your website</p>
          </button>
          <button
            type="button"
            className="flex overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white text-left shadow-sm"
            onClick={na}
          >
            <div className="w-24 shrink-0 bg-[#93c5fd]" aria-hidden />
            <p className="flex items-center p-4 text-sm font-medium">In your email</p>
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="rounded-md border border-[var(--border-subtle)] bg-white px-6 py-2.5 text-sm font-medium"
            onClick={na}
          >
            Explore other ways to share
          </button>
        </div>
      </main>
      <FixedAskAiDock />
    </div>
  );
}

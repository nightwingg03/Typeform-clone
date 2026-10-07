"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { FormDetail, Question } from "@/lib/types";
import { FixedAskAiDock } from "./AskAiDock";
import { FormEditorHeader } from "./FormEditorHeader";
import { QuestionTypeChip } from "./FormElementCatalog";
import { useToast } from "./Toast";

interface WorkflowProps {
  formId: number;
}

function choicePreview(q: Question): string | null {
  if (q.type !== "multiple_choice" && q.type !== "dropdown") return null;
  if (!("choices" in q.config) || !Array.isArray(q.config.choices)) return null;
  const first = q.config.choices[0];
  return first ? `${first.label} - choice 1` : null;
}

export function Workflow({ formId }: WorkflowProps) {
  const { showToast } = useToast();
  const na = () => showToast("Not available");
  const [form, setForm] = useState<FormDetail | null>(null);

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

  if (!form) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-white">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const questions = [...form.questions].sort((a, b) => a.position - b.position);

  return (
    <div className="app-shell flex min-h-screen flex-col bg-white">
      <FormEditorHeader
        formId={formId}
        title={form.title}
        activeTab="workflow"
        status={form.status}
        onPublish={() => void togglePublish()}
        onHelp={na}
        onPlans={na}
        onProfile={na}
      />

      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-subtle)] bg-white px-4 py-2 text-sm">
        <button type="button" className="border-b-2 border-[var(--label)] pb-1 font-medium">
          Logic
        </button>
        {["Scoring", "Tagging", "Outcome quiz"].map((label) => (
          <button key={label} type="button" className="text-[var(--muted)]" onClick={na}>
            {label}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-[var(--border-subtle)]" />
        {["play", "branch", "history", "gear"].map((id) => (
          <button key={id} type="button" className="text-[var(--muted)]" onClick={na} aria-label={id}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              {id === "play" && <path d="M8 5v14l11-7L8 5z" fill="currentColor" />}
              {id === "branch" && (
                <path d="M6 6h12v4H10v8H6V6z" stroke="currentColor" strokeWidth="2" />
              )}
              {id === "history" && (
                <>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" />
                </>
              )}
              {id === "gear" && (
                <>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v2M12 20v2" stroke="currentColor" strokeWidth="2" />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex-1 overflow-x-auto overflow-y-auto p-8">
            <div className="flex min-w-max items-center gap-3">
              <div
                className="w-64 shrink-0 rounded-lg border-2 border-dashed border-[#ccc] bg-white p-4"
              >
                <button type="button" className="flex items-center gap-2 text-sm font-medium" onClick={na}>
                  Pull data in
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Track sources, identify respondents, and personalize the form content and flow
                  with URL parameters.
                </p>
                <button type="button" className="mt-3 text-lg text-[var(--muted)]" onClick={na}>
                  +
                </button>
              </div>

              {questions.map((q, i) => (
                <div key={q.id} className="flex shrink-0 items-center gap-3">
                  <div className="h-px w-8 bg-[#ccc]" />
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a222b] text-white"
                    onClick={na}
                  >
                    +
                  </button>
                  <div className="w-56 rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <QuestionTypeChip type={q.type} stepNumber={i + 1} />
                    </div>
                    <p className="mt-2 text-sm font-medium">{q.title}</p>
                    {choicePreview(q) ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">{choicePreview(q)}</p>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="flex shrink-0 items-center gap-3">
                <div className="h-px w-8 bg-[#ccc]" />
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a222b] text-white"
                  onClick={na}
                >
                  +
                </button>
                <div className="w-56 rounded-lg border border-[#e8e8e8] bg-white p-4 shadow-sm">
                  <p className="text-xs text-[var(--muted)]">End</p>
                  <p className="mt-1 text-sm font-medium">
                    {form.thank_you_title || "All done! Thanks for your time."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {["eye", "chart", "phone", "trash"].map((id) => (
                <button
                  key={id}
                  type="button"
                  className="rounded border border-[#e8e8e8] bg-white p-2"
                  onClick={na}
                  aria-label={id}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 border-l border-[var(--border-subtle)] bg-[#f3f3f3] p-4 lg:block">
          <h3 className="text-sm font-semibold">Actions</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-[#e8e8e8] bg-white p-3">
              <p className="text-sm font-medium">Connect</p>
              <div className="mt-2 flex gap-1">
                {["#34a853", "#0f9d58", "#ff6d00", "#ea4335"].map((c) => (
                  <span key={c} className="h-8 w-8 rounded" style={{ background: c }} />
                ))}
                <button type="button" className="ml-1 text-[var(--muted)]" onClick={na}>+</button>
              </div>
            </div>
            <div className="rounded-lg border border-[#e8e8e8] bg-white p-3">
              <p className="text-sm font-medium">
                Automations{" "}
                <span className="rounded bg-[#dbeafe] px-1 text-[10px] text-[#1d4ed8]">New</span>
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Activate automations based on submissions to this form.
              </p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={na} aria-label="Email">@</button>
                <button type="button" onClick={na}>+</button>
              </div>
            </div>
            <div className="rounded-lg border border-[#e8e8e8] bg-white p-3">
              <p className="text-sm font-medium">Contacts</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Map form responses to create or update your contacts.
              </p>
              <button type="button" className="mt-2" onClick={na} aria-label="Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      </div>
      <FixedAskAiDock />
    </div>
  );
}

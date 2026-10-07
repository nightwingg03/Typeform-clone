"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type {
  FormDetail,
  FormSummary,
  ResponseListItem,
  SummaryQuestion,
} from "@/lib/types";
import { FixedAskAiDock } from "./AskAiDock";
import { FormEditorHeader } from "./FormEditorHeader";
import { useToast } from "./Toast";

type ResultsView = "performance" | "summary" | "responses";

interface ResultsProps {
  formId: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const width = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm text-[var(--label)]">
        <span>{label}</span>
        <span className="text-[var(--muted)]">{count}</span>
      </div>
      <div className="mt-1 h-2 rounded bg-[#ebebeb]">
        <div
          className="h-2 rounded bg-[#191919]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SummaryBlock({ question }: { question: SummaryQuestion }) {
  if (question.type === "multiple_choice" || question.type === "dropdown") {
    const max = Math.max(0, ...(question.choices?.map((c) => c.count) ?? [0]));
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
        <h3 className="text-base font-medium">{question.title}</h3>
        {question.choices?.map((c) => (
          <Bar key={c.id} label={c.label} count={c.count} max={max || 1} />
        ))}
      </div>
    );
  }
  if (question.type === "yes_no") {
    const max = Math.max(question.yes_count ?? 0, question.no_count ?? 0, 1);
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
        <h3 className="text-base font-medium">{question.title}</h3>
        <Bar label="Yes" count={question.yes_count ?? 0} max={max} />
        <Bar label="No" count={question.no_count ?? 0} max={max} />
      </div>
    );
  }
  if (question.type === "rating") {
    const max = Math.max(
      0,
      ...(question.distribution?.map((d) => d.count) ?? [0]),
      1,
    );
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
        <h3 className="text-base font-medium">{question.title}</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Average: {question.average ?? "—"}
        </p>
        {question.distribution?.map((d) => (
          <Bar key={d.value} label={`${d.value} ★`} count={d.count} max={max} />
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm">
      <h3 className="text-base font-medium">{question.title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {question.answered_count} answered
      </p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-normal tracking-tight text-[var(--label)]">
        {value}
      </p>
    </div>
  );
}

export function Results({ formId }: ResultsProps) {
  const { showToast } = useToast();
  const [view, setView] = useState<ResultsView>("performance");
  const [form, setForm] = useState<FormDetail | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);

  const na = () => showToast("Not available");

  const load = useCallback(async () => {
    try {
      const [formData, summaryData, listData] = await Promise.all([
        api.getForm(formId),
        api.getSummary(formId),
        api.listResponses(formId),
      ]);
      setForm(formData);
      setSummary(summaryData);
      setResponses(listData.responses);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load results");
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

  const subTabClass = (active: boolean) =>
    active
      ? "border-b-2 border-[var(--label)] pb-2 font-medium text-[var(--label)]"
      : "pb-2 text-[var(--muted)] hover:text-[var(--label)]";

  const responseCount = form?.response_count ?? summary?.response_count ?? 0;

  return (
    <div className="app-shell flex min-h-screen flex-col bg-[#f3f3f3]">
      <FormEditorHeader
        formId={formId}
        title={form?.title ?? "Results"}
        activeTab="results"
        status={form?.status ?? "draft"}
        onPublish={() => void togglePublish()}
        onHelp={na}
        onPlans={na}
        onProfile={na}
      />

      <div className="border-b border-[var(--border-subtle)] bg-white px-4">
        <nav className="flex flex-wrap items-center justify-center gap-8 px-2 py-3 text-sm">
          <button
            type="button"
            className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--label)]"
            onClick={na}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3l1.2 3.6L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3z"
                fill="#006b5e"
              />
            </svg>
            Smart Insights
          </button>
          <button
            type="button"
            className={subTabClass(view === "performance")}
            onClick={() => setView("performance")}
          >
            Form performance
          </button>
          <button
            type="button"
            className={subTabClass(view === "summary")}
            onClick={() => setView("summary")}
          >
            Response summary
          </button>
          <button
            type="button"
            className={subTabClass(view === "responses")}
            onClick={() => setView("responses")}
          >
            Responses
          </button>
        </nav>
      </div>

      <main className="flex-1 bg-[#f0f0f0] px-6 py-8">
        {view === "performance" ? (
          <div className="mx-auto max-w-4xl">
            <h1 className="text-2xl font-normal text-[var(--label)]">
              Form performance
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Key metrics that show how your form is doing.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-1.5 text-sm"
                onClick={na}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" />
                </svg>
                All time
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#e0e0e0] bg-white px-4 py-1.5 text-sm"
                onClick={na}
              >
                All devices
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <h2 className="mt-8 text-lg font-medium text-[var(--label)]">At a glance</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard label="Views" value="—" />
              <MetricCard label="Starts" value="—" />
              <MetricCard label="Submissions" value={String(responseCount)} />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <MetricCard label="Completion rate" value="—" />
              <MetricCard label="Time to complete" value="—" />
            </div>
            <h2 className="mt-10 text-lg font-medium text-[var(--label)]">
              See where users drop off
            </h2>
            <div
              className="mt-4 h-48 rounded-xl"
              style={{ background: "#eef8f4" }}
              aria-hidden
            />
          </div>
        ) : null}

        {view === "summary" && summary ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="text-sm text-[var(--muted)]">
              {summary.response_count} responses
            </p>
            {summary.questions.map((q) => (
              <SummaryBlock key={q.question_id} question={q} />
            ))}
          </div>
        ) : null}

        {view === "responses" ? (
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-left text-[var(--muted)]">
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border-subtle)]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/forms/${formId}/results/${r.id}`}
                        className="text-[var(--label)] hover:underline"
                      >
                        {formatDate(r.submitted_at)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
      <FixedAskAiDock />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import {
  CONNECT_INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  categoryCount,
  type IntegrationCategory,
  type IntegrationItem,
} from "@/lib/connectIntegrations";
import type { FormDetail } from "@/lib/types";
import { FixedAskAiDock } from "./AskAiDock";
import { FormEditorHeader } from "./FormEditorHeader";
import { IntegrationLogo } from "./IntegrationLogos";
import { useToast } from "./Toast";

interface ConnectProps {
  formId: number;
}

function actionLabel(item: IntegrationItem): string {
  if (item.action === "manage") return "Manage form mapping";
  if (item.action === "upgrade") return "Upgrade";
  return "Connect";
}

export function Connect({ formId }: ConnectProps) {
  const { showToast } = useToast();
  const na = () => showToast("Not available");
  const [form, setForm] = useState<FormDetail | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IntegrationCategory | "All">("All");
  const [zapierPrompt, setZapierPrompt] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONNECT_INTEGRATIONS.filter((item) => {
      if (category !== "All" && !item.categories.includes(category)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  if (!form) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-white">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  const zapierReady = zapierPrompt.trim().length > 0;

  return (
    <div className="app-shell flex min-h-screen flex-col bg-white">
      <FormEditorHeader
        formId={formId}
        title={form.title}
        activeTab="connect"
        status={form.status}
        onPublish={() => void togglePublish()}
        onHelp={na}
        onPlans={na}
        onProfile={na}
      />

      <div className="flex gap-6 border-b border-[var(--border-subtle)] bg-white px-4 py-2 text-xs font-semibold tracking-wide">
        <button type="button" className="border-b-2 border-[var(--label)] pb-1 text-[var(--label)]">
          INTEGRATIONS
        </button>
        <button type="button" className="pb-1 text-[var(--muted)]" onClick={na}>
          WEBHOOKS
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-[var(--border-subtle)] bg-[#f3f3f3] p-6 lg:w-[280px] lg:border-b-0 lg:border-r">
          <h2 className="text-lg font-semibold text-[var(--label)]">
            Connect Typeform to your favorite apps
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Create automated, efficient workflows that work for you.
          </p>
          <div className="relative mt-6">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="search"
              placeholder="Search integrations"
              className="w-full rounded-lg border border-[#e0e0e0] bg-white py-2.5 pl-10 pr-3 text-sm outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Categories
          </p>
          <ul className="mt-2 space-y-0.5 text-sm">
            <li>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left ${
                  category === "All" ? "bg-white font-medium shadow-sm" : "text-[var(--muted)]"
                }`}
                onClick={() => setCategory("All")}
              >
                All
                <span className="text-xs text-[var(--muted)]">{categoryCount("All")}</span>
              </button>
            </li>
            {INTEGRATION_CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left ${
                    category === cat ? "bg-white font-medium shadow-sm" : "text-[var(--muted)]"
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  <span className="pr-2">{cat}</span>
                  <span className="shrink-0 text-xs text-[var(--muted)]">{categoryCount(cat)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-white p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="rounded-xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="text-lg" aria-hidden>✨</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">Generate a custom flow with Zapier AI</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Describe what you want to do with your data
                  </p>
                  <textarea
                    className="mt-3 w-full resize-none rounded-lg border border-[#e0e0e0] p-3 text-sm outline-none"
                    rows={3}
                    placeholder="E.g. When the typeform is submitted, check if leads exist in Salesforce and send details to Slack"
                    value={zapierPrompt}
                    onChange={(e) => setZapierPrompt(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">Powered by zapier</span>
                    <button
                      type="button"
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        zapierReady
                          ? "bg-[#2a222b] text-white"
                          : "cursor-not-allowed bg-[#e8e8e8] text-[#9ca3af]"
                      }`}
                      onClick={na}
                    >
                      Generate flow
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[#e8e8e8] bg-white p-5 shadow-sm"
              >
                <div className="flex min-w-0 gap-4">
                  <IntegrationLogo id={item.logo} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.premiumBadge ? (
                        <span
                          className="inline-block h-2 w-2 rotate-45 rounded-sm bg-[#14b8a6]"
                          title="Premium"
                          aria-label="Premium"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-[#2a222b] px-4 py-2 text-sm font-medium text-white"
                  onClick={na}
                >
                  {actionLabel(item)}
                </button>
              </div>
            ))}

            {filtered.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)]">No integrations match your search.</p>
            ) : null}
          </div>
        </main>
      </div>
      <FixedAskAiDock />
    </div>
  );
}

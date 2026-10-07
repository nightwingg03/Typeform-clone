"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import { AskAiDock } from "./AskAiDock";
import { SmallScreenWarning } from "./SmallScreenWarning";
import { useToast } from "./Toast";

type HomeTab =
  | "forms"
  | "contacts"
  | "automations"
  | "insights"
  | "pages"
  | "research";

function formatListDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function GreenDiamond({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5l2-5z" fill="#006b5e" />
    </svg>
  );
}

function FormThumbIcon() {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
      style={{ background: "#7c6b8a" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 8h12M6 12h8M6 16h10" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <circle cx="17" cy="8" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    </span>
  );
}

function KebabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

export function Workspace() {
  const { showToast } = useToast();
  const na = () => showToast("Not available");
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FormListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [bannerOpen, setBannerOpen] = useState(true);
  const [tab, setTab] = useState<HomeTab>("forms");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortDesc, setSortDesc] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.listForms();
      setForms(data.forms);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = forms;
    if (q) list = list.filter((f) => f.title.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      const da = new Date(a.updated_at).getTime();
      const db = new Date(b.updated_at).getTime();
      return sortDesc ? db - da : da - db;
    });
    return list;
  }, [forms, search, sortDesc]);

  const totalResponses = forms.reduce((s, f) => s + f.response_count, 0);

  const handleCreate = async () => {
    try {
      const form = await api.createForm(modalTitle.trim());
      setCreateOpen(false);
      setModalTitle("");
      window.location.href = `/forms/${form.id}`;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create failed");
    }
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try {
      await api.patchForm(renameTarget.id, { title: modalTitle.trim() });
      setRenameTarget(null);
      setModalTitle("");
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rename failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteForm(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleDuplicate = async (id: number) => {
    setMenuOpenId(null);
    try {
      await api.duplicateForm(id);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Duplicate failed");
    }
  };

  const tabBtn = (
    id: HomeTab,
    label: string,
    icon: React.ReactNode,
    extra?: React.ReactNode,
  ) => (
    <button
      type="button"
      className={`flex items-center gap-1.5 border-b-2 px-1 pb-2 text-sm ${
        tab === id
          ? "border-[var(--label)] font-medium text-[var(--label)]"
          : "border-transparent text-[var(--muted)] hover:text-[var(--label)]"
      }`}
      onClick={() => setTab(id)}
    >
      {icon}
      {label}
      {extra}
    </button>
  );

  return (
    <div className="app-shell flex min-h-screen flex-col bg-white">
      <SmallScreenWarning />
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-3">
        <button
          type="button"
          className="flex items-center gap-2 text-sm"
          onClick={na}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded text-xs font-medium text-white"
            style={{ background: "#7c6b8a" }}
          >
            HS
          </span>
          <span className="font-medium">Workspace</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--muted)]" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <div className="flex items-center gap-6 text-sm text-[var(--label)]">
          <button type="button" className="flex items-center gap-2" onClick={na}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
            </svg>
            Integrations
          </button>
          <button type="button" className="flex items-center gap-2" onClick={na}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            </svg>
            Brand kit
          </button>
          <button type="button" aria-label="Help" onClick={na}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ background: "#9b8ab8" }}
          >
            HS
          </span>
        </div>
      </header>

      {bannerOpen ? (
        <div
          className="flex items-center justify-between gap-4 px-6 py-2 text-sm"
          style={{ background: "#e8f5e9" }}
        >
          <p className="flex items-center gap-2">
            <GreenDiamond />
            <span>
              You&apos;ve used{" "}
              <strong>{Math.min(100, Math.round((totalResponses / 10) * 100))}%</strong> of
              your Free plan&apos;s 10 responses a month.
            </span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md px-3 py-1 text-sm text-white"
              style={{ background: "#006b5e" }}
              onClick={na}
            >
              Get more responses
            </button>
            <button
              type="button"
              className="text-[var(--muted)]"
              aria-label="Dismiss"
              onClick={() => setBannerOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex border-b border-[var(--border-subtle)] px-6 gap-6">
        {tabBtn(
          "forms",
          "Forms",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
        )}
        {tabBtn(
          "contacts",
          "Contacts",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-2 1.5-3.5 3-3.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
        )}
        {tabBtn(
          "automations",
          "Automations",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
        )}
        {tabBtn(
          "insights",
          "Insights",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 18V6M8 18V10M12 18V14M16 18V8M20 18V4" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
          <GreenDiamond />,
        )}
        {tabBtn(
          "pages",
          "Pages",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7h8M8 11h6" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
          <span className="rounded bg-[#dbeafe] px-1 text-[10px] text-[#1d4ed8]">
            Beta
          </span>,
        )}
        {tabBtn(
          "research",
          "Research Flow",
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.5" />
          </svg>,
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[#f9f9f9]">
          <div className="p-4">
            <button
              type="button"
              className="w-full rounded-md px-4 py-2.5 text-sm font-medium text-white"
              style={{ background: "#3c323e" }}
              onClick={() => {
                setModalTitle("");
                setCreateOpen(true);
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
                </svg>
                Create form
              </span>
            </button>
            <div className="relative mt-3">
              <input
                className="app-input pl-9"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </div>
          </div>

          <div className="px-4">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Workspaces
              </span>
              <button type="button" onClick={na} aria-label="Add workspace">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between text-sm"
              onClick={() => setPrivateOpen((o) => !o)}
            >
              <span>Private</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d={privateOpen ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6"}
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
            {privateOpen ? (
              <div className="mt-1 flex items-center justify-between rounded-md bg-[#ebebeb] px-2 py-2 text-sm">
                <span>My workspace</span>
                <span className="text-[var(--muted)]">{forms.length}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-auto border-t border-[var(--border-subtle)] p-4 text-sm">
            <p className="text-[var(--muted)]">Responses collected</p>
            <div className="mt-2 h-1 rounded bg-[var(--line)]">
              <div
                className="h-1 rounded bg-[#3c323e]"
                style={{ width: `${Math.min(100, (totalResponses / 10) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {totalResponses} / 10
            </p>
            <button
              type="button"
              className="app-btn-secondary mt-3 w-full text-xs"
              onClick={na}
            >
              Increase response limit
            </button>
          </div>

          <AskAiDock />
        </aside>

        <main className="min-w-0 flex-1 bg-white p-6">
          {tab !== "forms" ? (
            <p className="text-[var(--muted)]">Not available</p>
          ) : loading ? (
            <p className="text-[var(--muted)]">Loading…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-medium">My workspace</h1>
                  <button type="button" className="text-[var(--muted)]" onClick={na} aria-label="More">
                    <KebabIcon />
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 py-1 text-sm"
                    onClick={na}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M6 20c0-3 2-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Invite
                    <GreenDiamond />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-sm"
                    onClick={() => setSortDesc((d) => !d)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Date created
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <div className="flex rounded-md border border-[var(--border-subtle)]">
                    <button
                      type="button"
                      className={`px-3 py-1.5 ${view === "list" ? "bg-[var(--page)]" : ""}`}
                      onClick={() => setView("list")}
                      aria-label="List view"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`border-l border-[var(--border-subtle)] px-3 py-1.5 ${view === "grid" ? "bg-[var(--page)]" : ""}`}
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="py-16 text-center text-[var(--muted)]">
                  No forms yet
                </div>
              ) : view === "grid" ? (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {filtered.map((form) => (
                    <Link
                      key={form.id}
                      href={`/forms/${form.id}`}
                      className="app-panel block p-4 hover:bg-[var(--page)]"
                    >
                      <FormThumbIcon />
                      <p className="mt-3 font-medium">{form.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {form.response_count} responses
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <table className="mt-6 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[var(--muted)]">
                      <th className="pb-2 font-medium" />
                      <th className="pb-2 font-medium">Responses</th>
                      <th className="pb-2 font-medium">Completed</th>
                      <th className="pb-2 font-medium">Updated</th>
                      <th className="pb-2 font-medium">Integrations</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((form) => (
                      <tr
                        key={form.id}
                        className="relative border-b border-[var(--border-subtle)] hover:bg-[var(--page)]"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/forms/${form.id}`}
                              className="flex min-w-0 flex-1 items-center gap-3"
                            >
                              <FormThumbIcon />
                              <span className="truncate font-medium">{form.title}</span>
                            </Link>
                            <button
                              type="button"
                              className="shrink-0 text-[var(--muted)]"
                              onClick={() =>
                                setMenuOpenId(menuOpenId === form.id ? null : form.id)
                              }
                              aria-label="Form menu"
                            >
                              <KebabIcon />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-[var(--muted)]">
                          {form.response_count || "—"}
                        </td>
                        <td className="py-3 text-[var(--muted)]">—</td>
                        <td className="py-3 text-[var(--muted)]">
                          {formatListDate(form.updated_at)}
                        </td>
                        <td className="py-3">
                          <button type="button" onClick={na} aria-label="Integrations">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            className="text-[var(--muted)]"
                            onClick={() =>
                              setMenuOpenId(menuOpenId === form.id ? null : form.id)
                            }
                            aria-label="More actions"
                          >
                            <KebabIcon />
                          </button>
                          {menuOpenId === form.id ? (
                            <div className="absolute right-0 z-10 mt-1 min-w-[140px] rounded-lg border border-[var(--border-subtle)] bg-white py-1 shadow-md">
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left hover:bg-[var(--page)]"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setRenameTarget(form);
                                  setModalTitle(form.title);
                                }}
                              >
                                Rename
                              </button>
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left hover:bg-[var(--page)]"
                                onClick={() => handleDuplicate(form.id)}
                              >
                                Duplicate
                              </button>
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left hover:bg-[var(--page)]"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  setDeleteTarget(form);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </main>
      </div>

      {(createOpen || renameTarget) && (
        <Modal
          title={createOpen ? "Create form" : "Rename form"}
          value={modalTitle}
          onChange={setModalTitle}
          onCancel={() => {
            setCreateOpen(false);
            setRenameTarget(null);
            setModalTitle("");
          }}
          onConfirm={() => void (createOpen ? handleCreate() : handleRename())}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="app-panel w-full max-w-md p-6">
            <h2 className="text-lg font-semibold">Delete form?</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              This will permanently delete &quot;{deleteTarget.title}&quot;.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="app-btn-secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => void handleDelete()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  value,
  onChange,
  onCancel,
  onConfirm,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
      <div className="app-panel w-full max-w-md p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <input
          className="app-input mt-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="app-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="app-btn-primary" onClick={onConfirm}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

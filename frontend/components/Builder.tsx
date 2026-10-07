"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import type { FormDetail, Question, QuestionType } from "@/lib/types";
import { QuestionCanvas } from "./QuestionCanvas";
import { QuestionList } from "./QuestionList";
import { QuestionSettings } from "./QuestionSettings";
import { EditorIconButton } from "./EditorIconButton";
import { FormEditorHeader } from "./FormEditorHeader";
import { Respondent } from "./Respondent";
import { SmallScreenWarning } from "./SmallScreenWarning";
import { useToast } from "./Toast";

interface BuilderProps {
  formId: number;
}

export function Builder({ formId }: BuilderProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormDetail | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [endingSelected, setEndingSelected] = useState(false);
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const savedTitleRef = useRef("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [designDraft, setDesignDraft] = useState({
    theme_color: "#4FB0AE",
    thank_you_title: "",
    thank_you_message: "",
  });
  const [leftDocked, setLeftDocked] = useState(true);
  const [rightDocked, setRightDocked] = useState(true);
  const [leftOverlayOpen, setLeftOverlayOpen] = useState(false);
  const [rightOverlayOpen, setRightOverlayOpen] = useState(false);

  useEffect(() => {
    const syncRails = () => {
      const w = window.innerWidth;
      setLeftDocked(w >= 1280);
      setRightDocked(w >= 1024);
      setLeftOverlayOpen(false);
      setRightOverlayOpen(false);
    };
    syncRails();
    window.addEventListener("resize", syncRails);
    return () => window.removeEventListener("resize", syncRails);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await api.getForm(formId);
      setForm(data);
      setTitleDraft(data.title);
      savedTitleRef.current = data.title;
      setDesignDraft({
        theme_color: data.theme_color,
        thank_you_title: data.thank_you_title,
        thank_you_message: data.thank_you_message,
      });
      setSelectedId((prev) => {
        if (endingSelected) return prev;
        if (prev && data.questions.some((q) => q.id === prev)) return prev;
        return data.questions[0]?.id ?? null;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load form");
    }
  }, [endingSelected, formId, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = form
    ? [...form.questions].sort((a, b) => a.position - b.position)
    : [];
  const selected = form?.questions.find((q) => q.id === selectedId) ?? null;
  const questionNumber =
    selected && sorted.length
      ? sorted.findIndex((q) => q.id === selected.id) + 1
      : 1;

  const saveTitle = async () => {
    if (!form || titleDraft.trim() === savedTitleRef.current) return;
    try {
      const updated = await api.patchForm(form.id, { title: titleDraft.trim() });
      setForm(updated);
      savedTitleRef.current = updated.title;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed");
      setTitleDraft(savedTitleRef.current);
    }
  };

  const patchQuestion = async (questionId: number, patch: Partial<Question>) => {
    try {
      await api.patchQuestion(formId, questionId, patch);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed");
    }
  };

  const patchThankYou = async (patch: {
    thank_you_title?: string;
    thank_you_message?: string;
  }) => {
    if (!form) return;
    try {
      const updated = await api.patchForm(form.id, patch);
      setForm(updated);
      setDesignDraft((d) => ({ ...d, ...patch }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleTypeChange = async (type: QuestionType) => {
    if (!selected) return;
    try {
      await api.patchQuestion(formId, selected.id, { type });
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Type change failed");
    }
  };

  const handleReorder = async (ids: number[]) => {
    try {
      await api.reorderQuestions(formId, ids);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Reorder failed");
      await load();
    }
  };

  const closeDesign = async () => {
    setDesignOpen(false);
    if (!form) return;
    try {
      const updated = await api.patchForm(form.id, designDraft);
      setForm(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Design save failed");
    }
  };

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

  const na = () => showToast("Not available");

  if (!form) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <SmallScreenWarning />
      <FormEditorHeader
        formId={formId}
        title={form.title}
        activeTab="content"
        status={form.status}
        onPublish={() => void togglePublish()}
        titleEditable
        titleDraft={titleDraft}
        onTitleDraftChange={setTitleDraft}
        onTitleBlur={() => void saveTitle()}
        onTitleKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setTitleDraft(savedTitleRef.current);
            e.currentTarget.blur();
          }
        }}
        onHelp={na}
        onPlans={na}
        onProfile={na}
      />

      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden bg-white p-3">
        {leftDocked ? (
          <QuestionList
            questions={form.questions}
            selectedId={selectedId}
            endingSelected={endingSelected}
            pickerOpen={addPickerOpen}
            onPickerOpenChange={setAddPickerOpen}
            onSelect={(id) => {
              setEndingSelected(false);
              setSelectedId(id);
            }}
            onSelectEnding={() => {
              setEndingSelected(true);
              setSelectedId(null);
            }}
            onReorder={(ids) => void handleReorder(ids)}
            onDelete={(id) => {
              void api.deleteQuestion(formId, id).then(load).catch((err) =>
                showToast(err instanceof Error ? err.message : "Delete failed"),
              );
            }}
            onAdd={(type) => {
              void api
                .createQuestion(formId, type)
                .then((q) => {
                  setEndingSelected(false);
                  setSelectedId(q.id);
                  return load();
                })
                .catch((err) =>
                  showToast(err instanceof Error ? err.message : "Add failed"),
                );
            }}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="editor-gray-box mt-3 flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto px-4 py-2">
            {!leftDocked ? (
              <EditorIconButton
                label="Pages"
                onClick={() => setLeftOverlayOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="12" y="4" width="8" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
              </EditorIconButton>
            ) : null}
            <button
              type="button"
              className="shrink-0 whitespace-nowrap rounded-md bg-[#191919] px-3 py-1.5 text-sm font-medium text-white"
              onClick={() => setAddPickerOpen(true)}
            >
              + Add content
            </button>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 whitespace-nowrap px-2 py-1.5 text-sm text-[var(--label)]"
              onClick={() => setDesignOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.1 2.5-.4L22 12l-8.5-8.5C12.7 2.1 12.4 2 12 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Design
            </button>
            <EditorIconButton label="Mobile preview" onClick={() => setMobilePreviewOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Preview" onClick={() => setPreviewOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
              </svg>
            </EditorIconButton>
            <span className="mx-1 h-6 w-px shrink-0 bg-[var(--border-subtle)]" />
            <EditorIconButton label="Layout" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect x="12" y="4" width="9" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Link" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Workflow" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 6h8a2 2 0 0 1 2 2v2M8 18h8a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Media" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
                <path d="M21 16l-5-5-4 4-3-3-6 6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="History" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Comments" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Settings" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="AI" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            <EditorIconButton label="Panel" onClick={na}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M15 4v16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </EditorIconButton>
            {!rightDocked ? (
              <EditorIconButton
                label="Settings"
                onClick={() => setRightOverlayOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v2M12 20v2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </EditorIconButton>
            ) : null}
          </div>
          <QuestionCanvas
            question={selected}
            endingSelected={endingSelected}
            thankYouTitle={form.thank_you_title}
            thankYouMessage={form.thank_you_message}
            questionNumber={questionNumber}
            onPatch={(patch) => {
              if (!selected) return;
              void patchQuestion(selected.id, patch);
            }}
            onPatchThankYou={(patch) => void patchThankYou(patch)}
          />
        </div>

        {rightDocked ? (
          <div className="h-full w-[300px] shrink-0 overflow-y-auto">
            <QuestionSettings
              question={selected}
              endingSelected={endingSelected}
              onPatch={(patch) => {
                if (!selected) return;
                void patchQuestion(selected.id, patch);
              }}
              onTypeChange={(type) => void handleTypeChange(type)}
            />
          </div>
        ) : null}
      </div>

      {!leftDocked && leftOverlayOpen ? (
        <RailOverlay side="left" onDismiss={() => setLeftOverlayOpen(false)}>
          <QuestionList
            questions={form.questions}
            selectedId={selectedId}
            endingSelected={endingSelected}
            pickerOpen={addPickerOpen}
            onPickerOpenChange={setAddPickerOpen}
            onSelect={(id) => {
              setEndingSelected(false);
              setSelectedId(id);
            }}
            onSelectEnding={() => {
              setEndingSelected(true);
              setSelectedId(null);
            }}
            onReorder={(ids) => void handleReorder(ids)}
            onDelete={(id) => {
              void api.deleteQuestion(formId, id).then(load).catch((err) =>
                showToast(err instanceof Error ? err.message : "Delete failed"),
              );
            }}
            onAdd={(type) => {
              void api
                .createQuestion(formId, type)
                .then((q) => {
                  setEndingSelected(false);
                  setSelectedId(q.id);
                  return load();
                })
                .catch((err) =>
                  showToast(err instanceof Error ? err.message : "Add failed"),
                );
            }}
            onClose={() => setLeftOverlayOpen(false)}
          />
        </RailOverlay>
      ) : null}

      {!rightDocked && rightOverlayOpen ? (
        <RailOverlay side="right" onDismiss={() => setRightOverlayOpen(false)}>
          <QuestionSettings
            question={selected}
            endingSelected={endingSelected}
            onPatch={(patch) => {
              if (!selected) return;
              void patchQuestion(selected.id, patch);
            }}
            onTypeChange={(type) => void handleTypeChange(type)}
            onClose={() => setRightOverlayOpen(false)}
          />
        </RailOverlay>
      ) : null}

      {previewOpen && (
        <Respondent
          form={form}
          mode="preview"
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {mobilePreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setMobilePreviewOpen(false)}
        >
          <div
            className="relative flex h-[min(720px,90vh)] w-[390px] max-w-full flex-col rounded-[2rem] border-[10px] border-[#1c1c1c] bg-[#1c1c1c] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Mobile preview"
          >
            <div
              className="absolute left-1/2 top-3 z-10 h-1 w-24 -translate-x-1/2 rounded-full bg-[#3a3a3a]"
              aria-hidden
            />
            <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-[1.35rem]">
              <Respondent
                form={form}
                mode="preview"
                layout="phone"
                onClose={() => setMobilePreviewOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {designOpen && (
        <Panel title="Design" onClose={() => void closeDesign()}>
          <label className="block text-xs text-[var(--muted)]">Accent color</label>
          <input
            type="color"
            className="mt-1 h-10 w-full rounded-lg border border-[var(--line)]"
            value={designDraft.theme_color}
            onChange={(e) =>
              setDesignDraft((d) => ({ ...d, theme_color: e.target.value }))
            }
          />
          <label className="mt-4 block text-xs text-[var(--muted)]">
            Thank-you title
          </label>
          <input
            className="app-input mt-1"
            value={designDraft.thank_you_title}
            onChange={(e) =>
              setDesignDraft((d) => ({ ...d, thank_you_title: e.target.value }))
            }
          />
          <label className="mt-4 block text-xs text-[var(--muted)]">
            Thank-you message
          </label>
          <textarea
            className="app-input mt-1"
            rows={3}
            value={designDraft.thank_you_message}
            onChange={(e) =>
              setDesignDraft((d) => ({
                ...d,
                thank_you_message: e.target.value,
              }))
            }
          />
        </Panel>
      )}

    </div>
  );
}

function RailOverlay({
  side,
  onDismiss,
  children,
}: {
  side: "left" | "right";
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-30 bg-black/25"
        aria-label="Close panel"
        onClick={onDismiss}
      />
      <div
        className={`fixed bottom-0 top-14 z-40 flex w-[min(300px,90vw)] flex-col bg-white shadow-xl ${
          side === "left" ? "left-0 w-[280px]" : "right-0"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </>
  );
}

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/25"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border-subtle)] bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="app-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

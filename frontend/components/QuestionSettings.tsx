"use client";

import type { ContactInfoConfig, Question, QuestionType } from "@/lib/types";
import { DEFAULT_CONTACT_INFO_CONFIG, QUESTION_TYPES } from "@/lib/types";
import { useToast } from "./Toast";

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  multiple_choice: "Multiple choice",
  dropdown: "Dropdown",
  email: "Email",
  number: "Number",
  yes_no: "Yes/No",
  rating: "Rating",
  contact_info: "Contact info",
};

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className="tf-switch"
        data-on={on ? "true" : "false"}
        onClick={() => onChange(!on)}
      >
        <span className="tf-switch-knob" />
      </button>
    </div>
  );
}

interface QuestionSettingsProps {
  question: Question | null;
  endingSelected: boolean;
  onPatch: (patch: Partial<Question>) => void;
  onTypeChange: (type: QuestionType) => void;
  onClose?: () => void;
}

export function QuestionSettings({
  question,
  endingSelected,
  onPatch,
  onTypeChange,
  onClose,
}: QuestionSettingsProps) {
  const { showToast } = useToast();
  const na = () => showToast("Not available");

  const shellClass =
    "flex h-full w-full shrink-0 flex-col overflow-y-auto bg-white";

  if (endingSelected) {
    return (
      <aside className={`${shellClass} p-4 text-sm text-[var(--muted)]`}>
        {onClose ? (
          <div className="mb-2 flex justify-end">
            <button type="button" className="text-sm text-[var(--muted)]" onClick={onClose}>
              Close
            </button>
          </div>
        ) : null}
        Edit the end screen in the canvas.
      </aside>
    );
  }

  if (!question) {
    return (
      <aside className={`${shellClass} p-4 text-sm text-[var(--muted)]`}>
        {onClose ? (
          <div className="mb-2 flex justify-end">
            <button type="button" className="text-sm text-[var(--muted)]" onClick={onClose}>
              Close
            </button>
          </div>
        ) : null}
        Question settings
      </aside>
    );
  }

  const choices =
    "choices" in question.config && Array.isArray(question.config.choices)
      ? question.config.choices
      : [];

  const addChoice = () => {
    const id = `c${Date.now()}`;
    onPatch({
      config: {
        choices: [...choices, { id, label: `Choice ${choices.length + 1}` }],
      },
    });
  };

  const removeChoice = (choiceId: string) => {
    if (choices.length <= 1) return;
    onPatch({
      config: { choices: choices.filter((c) => c.id !== choiceId) },
    });
  };

  const updateChoiceLabel = (choiceId: string, label: string) => {
    onPatch({
      config: {
        choices: choices.map((c) =>
          c.id === choiceId ? { ...c, label } : c,
        ),
      },
    });
  };

  return (
    <aside className={`${shellClass} gap-3 p-3`}>
      {onClose ? (
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            className="text-sm text-[var(--muted)] hover:text-[var(--label)]"
            onClick={onClose}
            aria-label="Close settings panel"
          >
            Close
          </button>
        </div>
      ) : null}

      <div className="editor-gray-box shrink-0 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Question</h3>
          <button
            type="button"
            className="text-[var(--muted)]"
            aria-label="Help"
            onClick={na}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="mt-3 flex gap-1 rounded-md border border-[#ececec] bg-white p-0.5">
          <button type="button" className="flex-1 rounded px-2 py-1 text-xs font-medium bg-[#2a222b] text-white">
            Text
          </button>
          <button
            type="button"
            className="flex-1 rounded px-2 py-1 text-xs text-[var(--muted)]"
            onClick={na}
          >
            Video
          </button>
        </div>
      </div>

      <div className="editor-gray-box flex min-h-[180px] shrink-0 flex-col p-4">
        <h3 className="text-sm font-medium">Answer</h3>
        <div className="mt-3 flex items-center justify-between border-b border-[#ececec] pb-3 text-sm text-[var(--muted)]">
          <span>Image or video</span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded border border-[#ececec] bg-white text-lg leading-none"
            onClick={na}
          >
            +
          </button>
        </div>
        <div className="mt-3 min-h-[100px] flex-1" aria-hidden />
      </div>

      <div className="editor-gray-box shrink-0 p-4">
        <label className="block text-xs text-[var(--muted)]">Type</label>
        <select
          className="app-input mt-1"
          value={question.type}
          onChange={(e) => onTypeChange(e.target.value as QuestionType)}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <Toggle
          label="Required"
          on={question.required}
          onChange={(v) => onPatch({ required: v })}
        />

        <label className="mt-4 block text-xs text-[var(--muted)]">Description</label>
        <textarea
          className="app-input mt-1"
          rows={2}
          value={question.description}
          onChange={(e) => onPatch({ description: e.target.value })}
          onBlur={(e) => onPatch({ description: e.target.value })}
        />

        {question.type === "contact_info" && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[var(--muted)]">Field placeholders</p>
            {(
              [
                ["first_name_placeholder", "First name"],
                ["last_name_placeholder", "Last name"],
                ["phone_placeholder", "Phone"],
                ["email_placeholder", "Email"],
                ["company_placeholder", "Company"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-[var(--muted)]">{label}</label>
                <input
                  className="app-input mt-1"
                  value={contactPlaceholders(question)[key]}
                  onChange={(e) =>
                    onPatch({
                      config: { ...contactPlaceholders(question), [key]: e.target.value },
                    })
                  }
                  onBlur={(e) =>
                    onPatch({
                      config: { ...contactPlaceholders(question), [key]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {(question.type === "short_text" ||
          question.type === "long_text" ||
          question.type === "email" ||
          question.type === "number") && (
          <>
            <label className="mt-4 block text-xs text-[var(--muted)]">
              Placeholder
            </label>
            <input
              className="app-input mt-1"
              value={placeholderFromConfig(question)}
              onChange={(e) =>
                onPatch({ config: { placeholder: e.target.value } })
              }
              onBlur={(e) =>
                onPatch({ config: { placeholder: e.target.value } })
              }
            />
          </>
        )}

        {question.type === "rating" && (
          <>
            <label className="mt-4 block text-xs text-[var(--muted)]">
              Max stars (3–10)
            </label>
            <input
              type="number"
              min={3}
              max={10}
              className="app-input mt-1"
              value={"max" in question.config ? question.config.max : 5}
              onChange={(e) =>
                onPatch({ config: { max: Number(e.target.value) } })
              }
              onBlur={(e) =>
                onPatch({ config: { max: Number(e.target.value) } })
              }
            />
          </>
        )}

        {(question.type === "multiple_choice" ||
          question.type === "dropdown") && (
          <div className="mt-4">
            <div className="text-xs text-[var(--muted)]">Choices</div>
            <ul className="mt-2 space-y-2">
              {choices.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <input
                    className="app-input flex-1"
                    value={c.label}
                    onChange={(e) => updateChoiceLabel(c.id, e.target.value)}
                    onBlur={(e) => updateChoiceLabel(c.id, e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={choices.length <= 1}
                    className="text-sm text-[var(--muted)] underline disabled:opacity-30"
                    onClick={() => removeChoice(c.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="app-btn-secondary mt-2"
              onClick={addChoice}
            >
              Add choice
            </button>
          </div>
        )}
      </div>

      <div className="editor-gray-box shrink-0 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Logic</span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded border border-[#ececec] bg-white"
            onClick={na}
          >
            +
          </button>
        </div>
      </div>

      <div className="editor-gray-box mb-1 shrink-0 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Comments</span>
          <button
            type="button"
            className="text-sm text-[var(--muted)] underline"
            onClick={na}
          >
            Add
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">No comments yet.</p>
      </div>
    </aside>
  );
}

function placeholderFromConfig(question: Question): string {
  if ("placeholder" in question.config && typeof question.config.placeholder === "string") {
    return question.config.placeholder;
  }
  return "";
}

function contactPlaceholders(question: Question): ContactInfoConfig {
  const c = question.config;
  if ("first_name_placeholder" in c) {
    return c as ContactInfoConfig;
  }
  return DEFAULT_CONTACT_INFO_CONFIG;
}

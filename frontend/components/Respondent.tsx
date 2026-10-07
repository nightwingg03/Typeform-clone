"use client";

/** One-question-at-a-time fill UI (preview or live submit). */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ContactFieldsFill } from "@/components/ContactFieldsUi";
import {
  contactAnswerFromValue,
  contactConfigFromQuestion,
  emptyContactAnswer,
} from "@/lib/contactInfo";
import { api } from "@/lib/api";
import type { ContactInfoAnswer, RespondentForm } from "@/lib/types";
import {
  PEARL_BG,
  PEARL_BUTTON_LABEL,
  PEARL_INK,
  PEARL_LINE,
  PEARL_MUTED_BG,
  PEARL_PLACEHOLDER,
} from "@/lib/pearlWhite";
import { isEmptyAnswer, validateAnswer } from "@/lib/validate";
import { useToast } from "./Toast";

type Mode = "preview" | "live";

interface RespondentProps {
  form: RespondentForm;
  mode: Mode;
  slug?: string;
  onClose?: () => void;
  layout?: "fullscreen" | "phone";
}

const INK = PEARL_INK;
const LINE = PEARL_LINE;
const MUTED_BG = PEARL_MUTED_BG;
const PLACEHOLDER = PEARL_PLACEHOLDER;

function choiceLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function ChevronUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 15l-6-6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Respondent({
  form,
  mode,
  slug,
  onClose,
  layout = "fullscreen",
}: RespondentProps) {
  const { showToast } = useToast();
  const questions = useMemo(
    () => [...form.questions].sort((a, b) => a.position - b.position),
    [form.questions],
  );
  const n = questions.length;

  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [idempotencyKey] = useState(() =>
    mode === "live" ? crypto.randomUUID() : "",
  );

  const current = questions[index];

  const progress = useMemo(() => {
    if (done) return 100;
    if (!started) return 0;
    if (n === 0) return 100;
    return Math.round(((index + 1) / n) * 100);
  }, [done, index, n, started]);

  const setAnswer = useCallback((questionId: number, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError(null);
  }, []);

  const goNext = useCallback(async () => {
    if (done) return;

    if (!started) {
      setStarted(true);
      if (n === 0) setDone(true);
      return;
    }

    if (n === 0) {
      setDone(true);
      return;
    }

    const question = questions[index];
    const value =
      question.type === "contact_info" && answers[question.id] === undefined
        ? emptyContactAnswer()
        : answers[question.id];
    const validationError = validateAnswer(question, value);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (index < n - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
      setError(null);
      return;
    }

    if (mode === "preview") {
      setDone(true);
      return;
    }

    if (!slug) return;

    const payload = questions
      .filter((q) => {
        const v = answers[q.id];
        return !isEmptyAnswer(v);
      })
      .map((q) => ({
        question_id: q.id,
        value: answers[q.id] as string | number | boolean | ContactInfoAnswer,
      }));

    try {
      await api.submitResponse(slug, payload, idempotencyKey);
      setDone(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Submit failed");
    }
  }, [
    answers,
    done,
    idempotencyKey,
    index,
    mode,
    n,
    questions,
    showToast,
    slug,
    started,
  ]);

  const goBack = useCallback(() => {
    if (done) return;
    if (started && index === 0) {
      setStarted(false);
      setError(null);
      return;
    }
    if (!started || index === 0) return;
    setDirection(-1);
    setIndex((i) => i - 1);
    setError(null);
  }, [done, index, started]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (done) return;

      if (!started) {
        if (event.key === "Enter") {
          event.preventDefault();
          void goNext();
        }
        return;
      }

      if (!current) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        goBack();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        void goNext();
        return;
      }

      if (
        current.type === "multiple_choice" &&
        event.key.length === 1 &&
        /[a-z]/i.test(event.key)
      ) {
        const choiceIndex = event.key.toUpperCase().charCodeAt(0) - 65;
        const choices =
          "choices" in current.config ? current.config.choices : [];
        if (choiceIndex >= 0 && choiceIndex < choices.length) {
          setAnswer(current.id, choices[choiceIndex].id);
        }
        return;
      }

      if (event.key === "Enter") {
        if (current.type === "long_text") {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            void goNext();
          }
          return;
        }
        event.preventDefault();
        void goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, done, goBack, goNext, setAnswer, started]);

  const inputClass =
    "mt-3 block h-11 w-full border-b bg-transparent text-2xl outline-none placeholder:text-[#6f6a6f]";

  const renderControl = () => {
    if (!current) return null;
    const value = answers[current.id];
    const placeholder =
      "placeholder" in current.config ? current.config.placeholder : "";
    const label = current.title;

    if (current.type === "long_text") {
      return (
        <textarea
          className="w-full resize-none border-b bg-transparent text-2xl outline-none"
          style={{ borderColor: LINE, color: INK }}
          rows={4}
          aria-label={label}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setAnswer(current.id, e.target.value)}
          placeholder={placeholder}
        />
      );
    }

    if (
      current.type === "short_text" ||
      current.type === "email" ||
      current.type === "number"
    ) {
      return (
        <input
          className={inputClass.replace("mt-3", "mt-0")}
          style={{ borderColor: LINE, color: INK }}
          type={current.type === "number" ? "number" : "text"}
          aria-label={label}
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => {
            if (current.type === "number") {
              const raw = e.target.value;
              setAnswer(current.id, raw === "" ? "" : Number(raw));
            } else {
              setAnswer(current.id, e.target.value);
            }
          }}
          placeholder={placeholder}
        />
      );
    }

    if (current.type === "dropdown") {
      const choices =
        "choices" in current.config ? current.config.choices : [];
      return (
        <select
          className={`${inputClass.replace("mt-3", "mt-0")} text-xl`}
          style={{ borderColor: LINE, color: INK }}
          aria-label={label}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setAnswer(current.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {choices.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      );
    }

    if (current.type === "multiple_choice") {
      const choices =
        "choices" in current.config ? current.config.choices : [];
      return (
        <div className="mt-11 flex flex-col gap-2">
          {choices.map((choice, i) => {
            const selected = value === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                className="flex items-center gap-3 rounded border px-4 py-3 text-left transition"
                style={{
                  borderColor: selected ? INK : LINE,
                  borderRadius: 4,
                }}
                onClick={() => setAnswer(current.id, choice.id)}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center text-sm font-medium text-white"
                  style={{ background: INK, borderRadius: 4 }}
                >
                  {choiceLetter(i)}
                </span>
                <span style={{ color: INK }}>{choice.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (current.type === "yes_no") {
      return (
        <div className="mt-11 flex flex-col gap-2">
          {[
            { label: "Yes", val: true },
            { label: "No", val: false },
          ].map((opt) => {
            const selected = value === opt.val;
            return (
              <button
                key={opt.label}
                type="button"
                className="rounded border px-4 py-3 text-left text-lg"
                style={{
                  borderColor: selected ? INK : LINE,
                  color: INK,
                  borderRadius: 4,
                }}
                onClick={() => setAnswer(current.id, opt.val)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    if (current.type === "rating") {
      const max =
        "max" in current.config && typeof current.config.max === "number"
          ? current.config.max
          : 5;
      const rating = typeof value === "number" ? value : 0;
      return (
        <div className="mt-11 flex gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl"
              style={{ color: star <= rating ? INK : LINE }}
              onClick={() => setAnswer(current.id, star)}
              aria-label={`${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
      );
    }

    if (current.type === "contact_info") {
      const cfg = contactConfigFromQuestion(current);
      const contact = contactAnswerFromValue(value);
      return (
        <ContactFieldsFill
          config={cfg}
          values={contact}
          onChange={(key, next) =>
            setAnswer(current.id, { ...contact, [key]: next })
          }
          onPhoneCountryClick={() => showToast("Not available")}
        />
      );
    }

    return null;
  };

  const primaryLabel = !started
    ? "Start"
    : index === n - 1
      ? "Submit"
      : "OK";

  const primaryButton = (
    <button
      type="button"
      className="mt-8 rounded-md px-4 py-2 text-base leading-6"
      style={{ background: INK, color: PEARL_BUTTON_LABEL, borderRadius: 4 }}
      onClick={() => void goNext()}
    >
      {primaryLabel}
    </button>
  );

  const rootClass =
    layout === "phone"
      ? "relative flex h-full min-h-0 flex-col overflow-hidden"
      : "fixed inset-0 z-50 flex min-h-screen flex-col";

  return (
    <div
      className={rootClass}
      style={{ background: PEARL_BG, color: INK }}
    >
      <header className="px-1 pt-1" aria-label="Form progress">
        <div className="h-0.5 w-full" style={{ background: LINE }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: `${INK}80`,
            }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 pb-24 pt-[72px]">
        {done ? (
          <div>
            <h1 className="text-2xl font-normal">{form.thank_you_title}</h1>
            <p className="mt-4 text-lg" style={{ color: PLACEHOLDER }}>
              {form.thank_you_message}
            </p>
            {mode === "preview" && onClose ? (
              <button
                type="button"
                className="mt-8 rounded-md px-4 py-2 text-base text-white"
                style={{ background: INK }}
                onClick={onClose}
              >
                Close
              </button>
            ) : null}
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={!started ? "welcome" : current?.id ?? "empty"}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 20 : -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {!started ? (
                <>
                  <h1 className="text-2xl font-normal leading-none">{form.title}</h1>
                  {primaryButton}
                </>
              ) : current ? (
                <form aria-label={current.title} onSubmit={(e) => e.preventDefault()}>
                  <fieldset className="border-0 p-0">
                    <legend
                      className="relative -left-7 flex items-center gap-2 text-2xl font-normal leading-none"
                    >
                      <span
                        className="flex size-4 items-center justify-center text-[11px] text-white"
                        style={{ background: INK, borderRadius: 4 }}
                      >
                        {index + 1}
                      </span>
                      <span>
                        {current.title}
                        {current.required ? "*" : null}
                      </span>
                    </legend>
                    {current.description ? (
                      <p className="mt-2 text-base" style={{ color: PLACEHOLDER }}>
                        {current.description}
                      </p>
                    ) : null}
                    <div className="mt-11">{renderControl()}</div>
                    {error ? (
                      <p className="mt-3 text-sm text-red-600">{error}</p>
                    ) : null}
                    {primaryButton}
                  </fieldset>
                </form>
              ) : (
                <p style={{ color: PLACEHOLDER }}>This form has no questions.</p>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {!done && started ? (
        <footer className="fixed bottom-8 right-8 flex items-center gap-2">
          <nav className="flex items-center gap-1" aria-label="Question navigation">
            <button
              type="button"
              aria-label="Navigate to previous question"
              className="flex size-8 items-center justify-center rounded-md"
              style={{
                background: MUTED_BG,
                color: PLACEHOLDER,
                borderRadius: 4,
              }}
              onClick={goBack}
            >
              <ChevronUp />
            </button>
            <button
              type="button"
              aria-label="Navigate to next question"
              className="flex size-8 items-center justify-center rounded-md text-white"
              style={{ background: INK, borderRadius: 4 }}
              onClick={() => void goNext()}
            >
              <ChevronDown />
            </button>
          </nav>
        </footer>
      ) : null}
    </div>
  );
}

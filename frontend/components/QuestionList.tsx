"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Question, QuestionType } from "@/lib/types";
import { AskAiDock } from "./AskAiDock";
import { ContentPickerModal, QuestionTypeChip } from "./FormElementCatalog";
import { useToast } from "./Toast";

interface QuestionListProps {
  questions: Question[];
  selectedId: number | null;
  endingSelected: boolean;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  onSelect: (id: number) => void;
  onSelectEnding: () => void;
  onReorder: (ids: number[]) => void;
  onDelete: (id: number) => void;
  onAdd: (type: QuestionType) => void;
  onClose?: () => void;
}

function SortableRow({
  question,
  index,
  selected,
  onSelect,
  onDelete,
}: {
  question: Question;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stepNumber = index + 1;

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`flex items-center gap-1 rounded-lg border px-2 py-2 text-sm ${
          selected
            ? "border-transparent bg-[var(--editor-hover)]"
            : "border-[#ececec] bg-white"
        }`}
      >
        <button
          type="button"
          className="cursor-grab px-0.5 text-[var(--muted)]"
          {...attributes}
          {...listeners}
          aria-label="Reorder"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" aria-hidden>
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="2" cy="7" r="1" />
            <circle cx="6" cy="7" r="1" />
            <circle cx="2" cy="12" r="1" />
            <circle cx="6" cy="12" r="1" />
          </svg>
        </button>
        {selected ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--muted)]" aria-hidden>
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        ) : (
          <QuestionTypeChip type={question.type} stepNumber={stepNumber} />
        )}
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-[var(--label)]"
          onClick={onSelect}
        >
          {question.title}
        </button>
        <button
          type="button"
          className="px-1 text-[var(--muted)] hover:text-[var(--label)]"
          onClick={onDelete}
          title="Delete"
          aria-label="More"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function QuestionList({
  questions,
  selectedId,
  endingSelected,
  pickerOpen,
  onPickerOpenChange,
  onSelect,
  onSelectEnding,
  onReorder,
  onDelete,
  onAdd,
  onClose,
}: QuestionListProps) {
  const { showToast } = useToast();
  const na = () => showToast("Not available");
  const sorted = [...questions].sort((a, b) => a.position - b.position);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sorted.map((q) => q.id);
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...ids];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next);
  };

  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col bg-white">
      {onClose ? (
        <div className="flex items-center justify-end border-b border-[var(--border-subtle)] px-3 py-2">
          <button
            type="button"
            className="text-sm text-[var(--muted)] hover:text-[var(--label)]"
            onClick={onClose}
            aria-label="Close pages panel"
          >
            Close
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="editor-gray-box mx-3 mt-3 flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm text-[var(--label)]"
        onClick={na}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12" y="4" width="8" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="flex-1 text-left">Universal mode</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <div className="mx-3 mb-3 mt-3 flex min-h-0 flex-1 flex-col gap-3">
        <div className="editor-gray-box flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          <p className="shrink-0 text-sm font-semibold text-[var(--label)]">Pages</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sorted.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
                {sorted.map((q, i) => (
                  <SortableRow
                    key={q.id}
                    question={q}
                    index={i}
                    selected={!endingSelected && q.id === selectedId}
                    onSelect={() => onSelect(q.id)}
                    onDelete={() => onDelete(q.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="editor-gray-box flex min-h-0 flex-1 flex-col overflow-hidden p-3">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-semibold text-[var(--label)]">Endings</span>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#ececec] bg-white text-lg leading-none text-[var(--muted)]"
              aria-label="Add ending"
              onClick={onSelectEnding}
            >
              +
            </button>
          </div>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
            <button
              type="button"
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                endingSelected
                  ? "border-transparent bg-[var(--editor-hover)] text-[var(--label)]"
                  : "border-[#ececec] bg-white text-[var(--muted)]"
              }`}
              onClick={onSelectEnding}
            >
              Thank you screen
            </button>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <AskAiDock />
      </div>

      {pickerOpen ? (
        <ContentPickerModal
          onClose={() => onPickerOpenChange(false)}
          onPick={onAdd}
          onUnavailable={na}
        />
      ) : null}
    </aside>
  );
}

"use client";

export function EditorIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--editor-surface)] hover:text-[var(--label)]"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

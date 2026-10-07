import Link from "next/link";

type Tab = "content" | "workflow" | "connect";

export function FormChrome({
  formId,
  active,
  children,
}: {
  formId: number;
  active: Tab;
  children: React.ReactNode;
}) {
  const tabClass = (tab: Tab) =>
    tab === active
      ? "border-b-2 border-[var(--label)] pb-1 font-medium text-[var(--label)]"
      : "pb-1 text-[var(--muted)] hover:text-[var(--label)]";

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="border-b border-[var(--border-subtle)] bg-white">
        <div className="px-6 py-3">
          <Link href="/" className="text-sm font-medium text-[var(--label)] hover:underline">
            Forms
          </Link>
        </div>
        <div className="flex justify-center gap-8 border-t border-[var(--border-subtle)] px-6 py-2 text-sm">
          <Link href={`/forms/${formId}`} className={tabClass("content")}>
            Content
          </Link>
          <Link href={`/forms/${formId}/logic`} className={tabClass("workflow")}>
            Workflow
          </Link>
          <Link href={`/forms/${formId}/connect`} className={tabClass("connect")}>
            Connect
          </Link>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}

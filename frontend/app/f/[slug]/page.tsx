"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Respondent } from "@/components/Respondent";
import { api } from "@/lib/api";
import type { PublicFormDetail } from "@/lib/types";

export default function PublicFillPage() {
  const params = useParams();
  const slug = String(params.slug);
  const [form, setForm] = useState<PublicFormDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getPublicForm(slug);
        setForm(data);
      } catch {
        setNotFound(true);
      }
    })();
  }, [slug]);

  if (notFound) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        This form is not available
      </div>
    );
  }

  if (!form) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--background)", color: "var(--muted)" }}
      >
        Loading…
      </div>
    );
  }

  return <Respondent form={form} mode="live" slug={slug} />;
}

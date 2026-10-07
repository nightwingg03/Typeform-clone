import { Results } from "@/components/Results";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Results formId={Number(id)} />;
}

import { Share } from "@/components/Share";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Share formId={Number(id)} />;
}

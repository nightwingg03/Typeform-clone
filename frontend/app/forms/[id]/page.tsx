import { Builder } from "@/components/Builder";

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Builder formId={Number(id)} />;
}

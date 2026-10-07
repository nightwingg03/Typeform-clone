import { Workflow } from "@/components/Workflow";

export default async function LogicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Workflow formId={Number(id)} />;
}

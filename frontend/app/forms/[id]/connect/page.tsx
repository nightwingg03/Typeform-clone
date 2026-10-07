import { Connect } from "@/components/Connect";

export default async function ConnectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Connect formId={Number(id)} />;
}

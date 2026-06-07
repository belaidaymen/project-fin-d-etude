import { redirect } from "next/navigation";

export default async function CreateMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/hardware/${id}`);
}

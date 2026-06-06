import { redirect } from "next/navigation";

export default async function CreateMaintenancePage({ params }: { params: { id: string } }) {
  redirect(`/hardware/${params.id}`);
}

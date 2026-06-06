import { redirect } from "next/navigation";

export default async function CheckinPage({ params }: { params: { id: string } }) {
  redirect(`/hardware/${params.id}`);
}

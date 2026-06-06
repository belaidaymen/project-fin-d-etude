import { redirect } from "next/navigation";

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  redirect(`/hardware/${params.id}`);
}

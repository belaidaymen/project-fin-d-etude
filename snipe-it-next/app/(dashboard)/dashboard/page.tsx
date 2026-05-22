import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;

  if (role === "LOGISTIQUE") redirect("/logistique");
  if (role === "MAGASINIER") redirect("/magasinier");
  if (role === "LABORATOIRE") redirect("/laboratoire");

  redirect("/login");
}

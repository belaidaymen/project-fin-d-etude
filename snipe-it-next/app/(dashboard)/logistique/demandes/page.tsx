import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import DemandesClient from "./DemandesClient";

export default async function DemandesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LOGISTIQUE") redirect("/dashboard");

  const demandes = await prisma.equipmentRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { requester: true, laboratoire: true, reviewer: true },
  });

  return (
    <DemandesClient
      demandes={demandes.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        type: d.type,
        quantity: d.quantity,
        urgency: d.urgency,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        laboratoire: d.laboratoire ? { name: d.laboratoire.name } : null,
        requester: { firstName: d.requester.firstName, lastName: d.requester.lastName },
        reviewer: d.reviewer ? { firstName: d.reviewer.firstName, lastName: d.reviewer.lastName } : null,
        reviewNote: d.reviewNote,
        reviewedAt: d.reviewedAt?.toISOString() ?? null,
      }))}
    />
  );
}

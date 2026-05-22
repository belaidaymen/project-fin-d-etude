import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import DemandesLabClient from "./DemandesLabClient";
import { AlertTriangle } from "lucide-react";

export default async function LaboDemandesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LABORATOIRE") redirect("/dashboard");

  const laboratoireId = (session.user as any).laboratoireId;

  if (!laboratoireId) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertTriangle size={48} style={{ color: "#f0ad4e" }} />
        <h2 style={{ color: "#888" }}>Aucun laboratoire associé à votre compte.</h2>
      </div>
    );
  }

  const demandes = await prisma.equipmentRequest.findMany({
    where: { laboratoireId },
    orderBy: { createdAt: "desc" },
    include: { reviewer: true },
  });

  return (
    <DemandesLabClient
      laboratoireId={laboratoireId}
      demandes={demandes.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        quantity: d.quantity,
        urgency: d.urgency,
        status: d.status,
        createdAt: d.createdAt.toISOString(),
        reviewNote: d.reviewNote,
        reviewer: d.reviewer ? { firstName: d.reviewer.firstName, lastName: d.reviewer.lastName } : null,
        reviewedAt: d.reviewedAt?.toISOString() ?? null,
      }))}
    />
  );
}

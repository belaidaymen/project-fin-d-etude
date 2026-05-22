import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import MouvementsClient from "./MouvementsClient";

export default async function MouvementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "MAGASINIER") redirect("/dashboard");

  const [mouvements, assets, locations] = await Promise.all([
    prisma.equipmentMovement.findMany({
      orderBy: { createdAt: "desc" },
      include: { asset: true, fromLocation: true, toLocation: true, doneBy: true },
    }),
    prisma.asset.findMany({ where: { deletedAt: null }, orderBy: { assetTag: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <MouvementsClient
      mouvements={mouvements.map(m => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        reference: m.reference,
        note: m.note,
        createdAt: m.createdAt.toISOString(),
        asset: { assetTag: m.asset.assetTag, name: m.asset.name },
        fromLocation: m.fromLocation ? { name: m.fromLocation.name } : null,
        toLocation: m.toLocation ? { name: m.toLocation.name } : null,
        doneBy: { firstName: m.doneBy.firstName, lastName: m.doneBy.lastName },
      }))}
      assets={assets.map(a => ({ id: a.id, assetTag: a.assetTag, name: a.name }))}
      locations={locations.map(l => ({ id: l.id, name: l.name }))}
    />
  );
}

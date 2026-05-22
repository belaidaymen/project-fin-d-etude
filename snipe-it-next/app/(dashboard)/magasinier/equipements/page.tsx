import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EquipementsClient from "./EquipementsClient";

export default async function MagasinierEquipementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "MAGASINIER") redirect("/dashboard");

  const [assets, categories, locations, statuses] = await Promise.all([
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: { category: true, location: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <EquipementsClient
      assets={assets.map(a => ({
        id: a.id,
        assetTag: a.assetTag,
        name: a.name,
        reference: a.reference,
        serial: a.serial,
        quantity: a.quantity,
        purchaseCost: a.purchaseCost ? Number(a.purchaseCost) : null,
        purchaseDate: a.purchaseDate?.toISOString() ?? null,
        notes: a.notes,
        category: a.category ? { id: a.category.id, name: a.category.name } : null,
        location: a.location ? { id: a.location.id, name: a.location.name } : null,
        status: a.status ? { id: a.status.id, name: a.status.name, color: a.status.color } : null,
      }))}
      categories={categories.map(c => ({ id: c.id, name: c.name }))}
      locations={locations.map(l => ({ id: l.id, name: l.name }))}
      statuses={statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))}
    />
  );
}

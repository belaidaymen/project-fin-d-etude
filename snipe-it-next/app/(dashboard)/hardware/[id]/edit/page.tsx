import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AssetForm from "../../AssetForm";
import Link from "next/link";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [asset, categories, statuses, locations] = await Promise.all([
    prisma.asset.findFirst({ where: { id: id, deletedAt: null } }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Modifier l'équipement <small>{asset.assetTag}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/hardware">Équipements</Link></li>
          <li><Link href={`/hardware/${asset.id}`}>{asset.assetTag}</Link></li>
          <li className="active">Modifier</li>
        </ol>
      </section>
      <section className="content">
        <AssetForm
          asset={{
            id: asset.id,
            assetTag: asset.assetTag,
            name: asset.name,
            serial: asset.serial,
            reference: asset.reference,
            categoryId: asset.categoryId,
            statusId: asset.statusId,
            locationId: asset.locationId,
            purchaseDate: asset.purchaseDate?.toISOString() ?? null,
            purchaseCost: asset.purchaseCost?.toString() ?? null,
            notes: asset.notes,
            quantity: asset.quantity,
          }}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          statuses={statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}

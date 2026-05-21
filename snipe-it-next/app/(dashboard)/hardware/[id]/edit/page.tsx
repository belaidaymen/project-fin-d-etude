import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AssetForm from "../../AssetForm";
import Link from "next/link";

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [asset, models, statuses, suppliers, locations, companies, users] = await Promise.all([
    prisma.asset.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.assetModel.findMany({ where: { deletedAt: null }, include: { manufacturer: true }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
  ]);

  if (!asset) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Edit Asset <small>{asset.assetTag}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/hardware">Assets</Link></li>
          <li><Link href={`/hardware/${asset.id}`}>{asset.assetTag}</Link></li>
          <li className="active">Edit</li>
        </ol>
      </section>
      <section className="content">
        <AssetForm
          asset={{
            ...asset,
            purchaseDate: asset.purchaseDate?.toISOString() ?? null,
            purchaseCost: asset.purchaseCost?.toString() ?? null,
          }}
          models={models.map(m => ({ id: m.id, name: m.name, manufacturer: m.manufacturer?.name ?? null }))}
          statuses={statuses.map(s => ({ id: s.id, name: s.name, type: s.statusType }))}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
          users={users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        />
      </section>
    </>
  );
}

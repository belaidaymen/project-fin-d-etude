import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import MaintenanceCreateForm from "./MaintenanceCreateForm";
import Link from "next/link";

export default async function CreateMaintenancePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [asset, suppliers] = await Promise.all([
    prisma.asset.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Log Maintenance <small>{asset.assetTag}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/hardware">Assets</Link></li>
          <li><Link href={`/hardware/${asset.id}`}>{asset.assetTag}</Link></li>
          <li className="active">Log Maintenance</li>
        </ol>
      </section>
      <section className="content">
        <MaintenanceCreateForm
          assetId={asset.id}
          assetTag={asset.assetTag}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
        />
      </section>
    </>
  );
}

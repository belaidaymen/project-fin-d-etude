import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import InventoryForm from "@/components/forms/InventoryForm";
import Link from "next/link";

export default async function EditConsumablePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [item, manufacturers, categories, suppliers, locations, companies] = await Promise.all([
    prisma.consumable.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "consumable" }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Consumable</h1><ol className="breadcrumb"><li><Link href="/consumables">Consumables</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <InventoryForm entityType="consumable" item={{ ...item, purchaseCost: item.purchaseCost?.toString() ?? null, purchaseDate: item.purchaseDate?.toISOString() ?? null }} manufacturers={manufacturers.map(m => ({ id: m.id, name: m.name }))} categories={categories.map(c => ({ id: c.id, name: c.name }))} suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))} locations={locations.map(l => ({ id: l.id, name: l.name }))} companies={companies.map(c => ({ id: c.id, name: c.name }))} />
      </section>
    </>
  );
}

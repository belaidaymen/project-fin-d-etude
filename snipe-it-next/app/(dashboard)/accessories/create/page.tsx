import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import InventoryForm from "@/components/forms/InventoryForm";

export default async function CreateAccessoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [manufacturers, categories, suppliers, locations, companies] = await Promise.all([
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "accessory" }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="content-header">
        <h1>Create Accessory</h1>
        <ol className="breadcrumb"><li><a href="/accessories">Accessories</a></li><li className="active">Create</li></ol>
      </section>
      <section className="content">
        <InventoryForm
          entityType="accessory"
          manufacturers={manufacturers.map(m => ({ id: m.id, name: m.name }))}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
        />
      </section>
    </>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditModelPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [item, manufacturers, categories, depreciations] = await Promise.all([
    prisma.assetModel.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "asset" }, orderBy: { name: "asc" } }),
    prisma.depreciation.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Model</h1><ol className="breadcrumb"><li><Link href="/models">Models</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="assetmodel" apiUrl="/api/models" backUrl="/models" item={{ ...item }} fields={[
          { name: "name", label: "Model Name", type: "text", required: true },
          { name: "modelNumber", label: "Model Number", type: "text" },
          { name: "manufacturerId", label: "Manufacturer", type: "select", options: manufacturers.map(m => ({ value: m.id, label: m.name })) },
          { name: "categoryId", label: "Category", type: "select", options: categories.map(c => ({ value: c.id, label: c.name })) },
          { name: "depreciationId", label: "Depreciation", type: "select", options: depreciations.map(d => ({ value: d.id, label: `${d.name} (${d.months} months)` })) },
          { name: "eol", label: "End of Life (months)", type: "number" },
          { name: "notes", label: "Notes", type: "textarea" },
          { name: "requestable", label: "Allow Requests", type: "checkbox" },
          { name: "requireSerial", label: "Require Serial Number", type: "checkbox" },
        ]} />
      </section>
    </>
  );
}

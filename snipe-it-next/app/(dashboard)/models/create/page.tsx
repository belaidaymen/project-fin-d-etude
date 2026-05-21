import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateModelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [manufacturers, categories, depreciations] = await Promise.all([
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "asset" }, orderBy: { name: "asc" } }),
    prisma.depreciation.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <section className="content-header"><h1>Create Asset Model</h1><ol className="breadcrumb"><li><a href="/models">Models</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="assetmodel"
          apiUrl="/api/models"
          backUrl="/models"
          fields={[
            { name: "name", label: "Model Name", type: "text", required: true },
            { name: "modelNumber", label: "Model Number", type: "text" },
            { name: "manufacturerId", label: "Manufacturer", type: "select", options: manufacturers.map(m => ({ value: m.id, label: m.name })) },
            { name: "categoryId", label: "Category", type: "select", options: categories.map(c => ({ value: c.id, label: c.name })) },
            { name: "depreciationId", label: "Depreciation", type: "select", options: depreciations.map(d => ({ value: d.id, label: `${d.name} (${d.months} months)` })) },
            { name: "eol", label: "End of Life (months)", type: "number" },
            { name: "notes", label: "Notes", type: "textarea" },
            { name: "requestable", label: "Allow Requests", type: "checkbox" },
            { name: "requireSerial", label: "Require Serial Number", type: "checkbox" },
          ]}
        />
      </section>
    </>
  );
}

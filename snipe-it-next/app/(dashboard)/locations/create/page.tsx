import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateLocationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [parents, companies] = await Promise.all([
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <section className="content-header"><h1>Create Location</h1><ol className="breadcrumb"><li><a href="/locations">Locations</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="location"
          apiUrl="/api/locations"
          backUrl="/locations"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "address", label: "Address", type: "text" },
            { name: "address2", label: "Address 2", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "state", label: "State/Province", type: "text" },
            { name: "country", label: "Country", type: "text" },
            { name: "zip", label: "Zip/Postal Code", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "parentId", label: "Parent Location", type: "select", options: parents.map(p => ({ value: p.id, label: p.name })) },
            { name: "companyId", label: "Company", type: "select", options: companies.map(c => ({ value: c.id, label: c.name })) },
          ]}
        />
      </section>
    </>
  );
}

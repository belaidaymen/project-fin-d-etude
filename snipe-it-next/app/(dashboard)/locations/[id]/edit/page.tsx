import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [item, parents] = await Promise.all([
    prisma.location.findFirst({ where: { id: id, deletedAt: null } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Location</h1><ol className="breadcrumb"><li><Link href="/locations">Locations</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="location"
          apiUrl="/api/locations"
          backUrl="/locations"
          item={{ ...item }}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "address", label: "Address", type: "text" },
            { name: "address2", label: "Address 2", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "state", label: "State/Province", type: "text" },
            { name: "country", label: "Country", type: "text" },
            { name: "zip", label: "Zip/Postal Code", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "parentId", label: "Emplacement parent", type: "select", options: parents.filter(p => p.id !== id).map(p => ({ value: p.id, label: p.name })) },
          ]}
        />
      </section>
    </>
  );
}

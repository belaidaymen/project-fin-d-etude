import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function CreateLocationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const parents = await prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <>
      <section className="content-header">
        <h1>Créer un emplacement</h1>
        <ol className="breadcrumb">
          <li><Link href="/locations">Emplacements</Link></li>
          <li className="active">Créer</li>
        </ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="location"
          apiUrl="/api/locations"
          backUrl="/locations"
          fields={[
            { name: "name", label: "Nom", type: "text", required: true },
            { name: "address", label: "Adresse", type: "text" },
            { name: "city", label: "Ville", type: "text" },
            { name: "state", label: "Région / Province", type: "text" },
            { name: "country", label: "Pays", type: "text" },
            { name: "zip", label: "Code postal", type: "text" },
            { name: "phone", label: "Téléphone", type: "text" },
            { name: "parentId", label: "Emplacement parent", type: "select", options: parents.map(p => ({ value: p.id, label: p.name })) },
          ]}
        />
      </section>
    </>
  );
}

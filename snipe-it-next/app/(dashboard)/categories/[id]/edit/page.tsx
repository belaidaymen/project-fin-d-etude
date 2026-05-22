import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import EntityForm from "@/components/forms/EntityForm";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const item = await prisma.categorie.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Modifier la catégorie</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/categories">Catégories</Link></li>
          <li><Link href={`/categories/${item.id}`}>{item.nom}</Link></li>
          <li className="active">Modifier</li>
        </ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="categorie"
          apiUrl="/api/categories"
          backUrl="/categories"
          item={{ id: item.id, nom: item.nom, description: item.description ?? "" }}
          fields={[
            { name: "nom", label: "Nom de la catégorie", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

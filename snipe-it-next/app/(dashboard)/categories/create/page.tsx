import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function CreateCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <>
      <section className="content-header">
        <h1>Nouvelle catégorie</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/categories">Catégories</Link></li>
          <li className="active">Nouvelle catégorie</li>
        </ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="categorie"
          apiUrl="/api/categories"
          backUrl="/categories"
          fields={[
            { name: "nom", label: "Nom de la catégorie", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

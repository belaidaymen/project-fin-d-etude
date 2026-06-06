import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header">
        <h1>Créer une catégorie</h1>
        <ol className="breadcrumb"><li><a href="/categories">Catégories</a></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="category"
          apiUrl="/api/categories"
          backUrl="/categories"
          fields={[
            { name: "name", label: "Nom", type: "text", required: true },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

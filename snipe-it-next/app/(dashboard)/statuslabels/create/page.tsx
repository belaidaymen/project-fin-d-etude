import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateStatusLabelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header">
        <h1>Créer un état</h1>
        <ol className="breadcrumb"><li><a href="/statuslabels">États</a></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="statuslabel"
          apiUrl="/api/statuslabels"
          backUrl="/statuslabels"
          fields={[
            { name: "name", label: "Nom", type: "text", required: true },
            { name: "color", label: "Couleur", type: "color" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

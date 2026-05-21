import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateStatusLabelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header"><h1>Create Status Label</h1><ol className="breadcrumb"><li><a href="/statuslabels">Status Labels</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="statuslabel"
          apiUrl="/api/statuslabels"
          backUrl="/statuslabels"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "statusType", label: "Status Type", type: "select", required: true, options: [
              { value: "deployable", label: "Deployable" },
              { value: "pending", label: "Pending" },
              { value: "archived", label: "Archived" },
              { value: "undeployable", label: "Undeployable" },
            ]},
            { name: "color", label: "Color", type: "color" },
            { name: "notes", label: "Notes", type: "textarea" },
            { name: "showInNav", label: "Show in Sidebar", type: "checkbox", defaultValue: true },
          ]}
        />
      </section>
    </>
  );
}

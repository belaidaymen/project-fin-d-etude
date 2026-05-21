import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateManufacturerPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header"><h1>Create Manufacturer</h1><ol className="breadcrumb"><li><a href="/manufacturers">Manufacturers</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="manufacturer"
          apiUrl="/api/manufacturers"
          backUrl="/manufacturers"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "url", label: "URL", type: "text" },
            { name: "supportUrl", label: "Support URL", type: "text" },
            { name: "supportPhone", label: "Support Phone", type: "text" },
            { name: "supportEmail", label: "Support Email", type: "text" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

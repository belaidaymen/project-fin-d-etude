import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header"><h1>Create Category</h1><ol className="breadcrumb"><li><a href="/categories">Categories</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="category"
          apiUrl="/api/categories"
          backUrl="/categories"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "categoryType", label: "Category Type", type: "select", required: true, options: [
              { value: "asset", label: "Asset" },
              { value: "accessory", label: "Accessory" },
              { value: "consumable", label: "Consumable" },
              { value: "component", label: "Component" },
              { value: "license", label: "License" },
            ]},
            { name: "eulaText", label: "EULA Text", type: "textarea" },
            { name: "notes", label: "Notes", type: "textarea" },
            { name: "requireAcceptance", label: "Require Acceptance", type: "checkbox" },
            { name: "checkinEmail", label: "Send Email on Check-In", type: "checkbox" },
          ]}
        />
      </section>
    </>
  );
}

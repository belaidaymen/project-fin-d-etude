import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateSupplierPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <>
      <section className="content-header"><h1>Create Supplier</h1><ol className="breadcrumb"><li><a href="/suppliers">Suppliers</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="supplier"
          apiUrl="/api/suppliers"
          backUrl="/suppliers"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "contact", label: "Contact Name", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "fax", label: "Fax", type: "text" },
            { name: "email", label: "Email", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "state", label: "State", type: "text" },
            { name: "country", label: "Country", type: "text" },
            { name: "zip", label: "Zip", type: "text" },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

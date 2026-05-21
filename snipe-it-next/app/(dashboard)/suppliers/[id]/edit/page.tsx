import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const item = await prisma.supplier.findFirst({ where: { id: params.id, deletedAt: null } });
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Supplier</h1><ol className="breadcrumb"><li><Link href="/suppliers">Suppliers</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="supplier" apiUrl="/api/suppliers" backUrl="/suppliers" item={{ ...item }} fields={[
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
        ]} />
      </section>
    </>
  );
}

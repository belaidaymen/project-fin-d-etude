import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const item = await prisma.category.findFirst({ where: { id: params.id, deletedAt: null } });
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Category</h1><ol className="breadcrumb"><li><Link href="/categories">Categories</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="category" apiUrl="/api/categories" backUrl="/categories" item={{ ...item }} fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "categoryType", label: "Category Type", type: "select", required: true, options: [{ value: "asset", label: "Asset" }, { value: "accessory", label: "Accessory" }, { value: "consumable", label: "Consumable" }, { value: "component", label: "Component" }, { value: "license", label: "License" }] },
          { name: "eulaText", label: "EULA Text", type: "textarea" },
          { name: "notes", label: "Notes", type: "textarea" },
          { name: "requireAcceptance", label: "Require Acceptance", type: "checkbox" },
          { name: "checkinEmail", label: "Send Email on Check-In", type: "checkbox" },
        ]} />
      </section>
    </>
  );
}

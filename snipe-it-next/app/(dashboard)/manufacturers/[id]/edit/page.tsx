import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditManufacturerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const item = await prisma.manufacturer.findFirst({ where: { id: params.id, deletedAt: null } });
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Manufacturer</h1><ol className="breadcrumb"><li><Link href="/manufacturers">Manufacturers</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="manufacturer" apiUrl="/api/manufacturers" backUrl="/manufacturers" item={{ ...item }} fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "url", label: "URL", type: "text" },
          { name: "supportUrl", label: "Support URL", type: "text" },
          { name: "supportPhone", label: "Support Phone", type: "text" },
          { name: "supportEmail", label: "Support Email", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
        ]} />
      </section>
    </>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditStatusLabelPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const item = await prisma.statuslabel.findFirst({ where: { id: params.id, deletedAt: null } });
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Status Label</h1><ol className="breadcrumb"><li><Link href="/statuslabels">Status Labels</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="statuslabel" apiUrl="/api/statuslabels" backUrl="/statuslabels" item={{ ...item }} fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "statusType", label: "Status Type", type: "select", required: true, options: [{ value: "deployable", label: "Deployable" }, { value: "pending", label: "Pending" }, { value: "archived", label: "Archived" }, { value: "undeployable", label: "Undeployable" }] },
          { name: "color", label: "Color", type: "color" },
          { name: "notes", label: "Notes", type: "textarea" },
          { name: "showInNav", label: "Show in Sidebar", type: "checkbox" },
        ]} />
      </section>
    </>
  );
}

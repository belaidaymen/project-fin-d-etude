import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditDepartmentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [item, companies, locations, users] = await Promise.all([
    prisma.department.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
  ]);
  if (!item) notFound();
  return (
    <>
      <section className="content-header"><h1>Edit Department</h1><ol className="breadcrumb"><li><Link href="/departments">Departments</Link></li><li className="active">Edit</li></ol></section>
      <section className="content">
        <EntityForm entityType="department" apiUrl="/api/departments" backUrl="/departments" item={{ ...item }} fields={[
          { name: "name", label: "Name", type: "text", required: true },
          { name: "phone", label: "Phone", type: "text" },
          { name: "companyId", label: "Company", type: "select", options: companies.map(c => ({ value: c.id, label: c.name })) },
          { name: "locationId", label: "Location", type: "select", options: locations.map(l => ({ value: l.id, label: l.name })) },
          { name: "managerId", label: "Manager", type: "select", options: users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })) },
          { name: "notes", label: "Notes", type: "textarea" },
        ]} />
      </section>
    </>
  );
}

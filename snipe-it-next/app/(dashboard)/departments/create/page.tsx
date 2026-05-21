import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";

export default async function CreateDepartmentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const [companies, locations, users] = await Promise.all([
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
  ]);
  return (
    <>
      <section className="content-header"><h1>Create Department</h1><ol className="breadcrumb"><li><a href="/departments">Departments</a></li><li className="active">Create</li></ol></section>
      <section className="content">
        <EntityForm
          entityType="department"
          apiUrl="/api/departments"
          backUrl="/departments"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "phone", label: "Phone", type: "text" },
            { name: "companyId", label: "Company", type: "select", options: companies.map(c => ({ value: c.id, label: c.name })) },
            { name: "locationId", label: "Location", type: "select", options: locations.map(l => ({ value: l.id, label: l.name })) },
            { name: "managerId", label: "Manager", type: "select", options: users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` })) },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}

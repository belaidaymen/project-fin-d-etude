import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserForm from "../UserForm";

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [companies, locations, departments, managers] = await Promise.all([
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
  ]);

  return (
    <>
      <section className="content-header">
        <h1>Create User</h1>
        <ol className="breadcrumb">
          <li><a href="/users">Users</a></li>
          <li className="active">Create</li>
        </ol>
      </section>
      <section className="content">
        <UserForm
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
          departments={departments.map(d => ({ id: d.id, name: d.name }))}
          managers={managers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        />
      </section>
    </>
  );
}

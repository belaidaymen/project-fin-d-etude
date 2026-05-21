import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserForm from "../../UserForm";
import Link from "next/link";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, companies, locations, departments, managers] = await Promise.all([
    prisma.user.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.department.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
  ]);

  if (!user) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Edit User <small>{user.username}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/users">Users</Link></li>
          <li><Link href={`/users/${user.id}`}>{user.firstName} {user.lastName}</Link></li>
          <li className="active">Edit</li>
        </ol>
      </section>
      <section className="content">
        <UserForm
          user={{ ...user, employeeNum: user.employeeNum, jobTitle: user.jobTitle, phone: user.phone, mobile: user.mobile, address: user.address, city: user.city, state: user.state, country: user.country, zip: user.zip, notes: user.notes, companyId: user.companyId, locationId: user.locationId, departmentId: user.departmentId, managerId: user.managerId }}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
          departments={departments.map(d => ({ id: d.id, name: d.name }))}
          managers={managers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        />
      </section>
    </>
  );
}

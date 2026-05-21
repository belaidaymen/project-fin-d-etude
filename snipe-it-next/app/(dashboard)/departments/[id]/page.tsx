import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function DepartmentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const dept = await prisma.department.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      company: true,
      location: true,
      manager: true,
      users: { where: { deletedAt: null, activated: true }, take: 30, orderBy: { firstName: "asc" } },
    },
  });
  if (!dept) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{dept.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/departments">Departments</Link></li>
          <li className="active">{dept.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/departments" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/departments/${dept.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Department Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{dept.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Company</td><td>{dept.company?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{dept.location ? <Link href={`/locations/${dept.location.id}`} style={{ color: "#337ab7" }}>{dept.location.name}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manager</td><td>{dept.manager ? <Link href={`/users/${dept.manager.id}`} style={{ color: "#337ab7" }}>{dept.manager.firstName} {dept.manager.lastName}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Phone</td><td>{dept.phone ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Users</td><td>{dept.users.length}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {dept.users.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Users ({dept.users.length})</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>Name</th><th>Username</th><th>Title</th></tr></thead>
                  <tbody>
                    {dept.users.map(u => (
                      <tr key={u.id}>
                        <td><Link href={`/users/${u.id}`} style={{ color: "#337ab7" }}>{u.firstName} {u.lastName}</Link></td>
                        <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.username}</td>
                        <td style={{ fontSize: 12, color: "#777" }}>{u.jobTitle ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

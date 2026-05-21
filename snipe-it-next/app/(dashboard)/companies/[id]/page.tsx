import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const company = await prisma.company.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      users: { where: { deletedAt: null }, take: 10, orderBy: { firstName: "asc" } },
      assets: { where: { deletedAt: null }, take: 10, orderBy: { createdAt: "desc" }, include: { model: true, status: true } },
      _count: { select: { users: true, assets: true, licenses: true, accessories: true } },
    },
  });
  if (!company) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{company.name} <small>Company Details</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/companies">Companies</Link></li>
          <li className="active">{company.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/companies" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/companies/${company.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Company Information</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "35%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{company.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Phone</td><td>{company.phone ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Fax</td><td>{company.fax ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Email</td><td>{company.email ? <a href={`mailto:${company.email}`}>{company.email}</a> : "—"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Users", value: company._count.users, color: "#3c8dbc" },
              { label: "Assets", value: company._count.assets, color: "#00a65a" },
              { label: "Licenses", value: company._count.licenses, color: "#d81b60" },
              { label: "Accessories", value: company._count.accessories, color: "#f39c12" },
            ].map(s => (
              <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
                <div className="box-body" style={{ textAlign: "center", padding: 15 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {company.users.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Users ({company._count.users})</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Name</th><th>Username</th><th>Email</th></tr></thead>
                <tbody>
                  {company.users.map(u => (
                    <tr key={u.id}>
                      <td><Link href={`/users/${u.id}`} style={{ color: "#337ab7" }}>{u.firstName} {u.lastName}</Link></td>
                      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.username}</td>
                      <td>{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

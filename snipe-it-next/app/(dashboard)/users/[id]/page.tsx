import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import DeleteUserButton from "./DeleteUserButton";

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      company: true,
      location: true,
      department: true,
      manager: true,
      assets: {
        where: { deletedAt: null },
        include: { model: { include: { manufacturer: true } }, status: true },
        orderBy: { createdAt: "desc" },
      },
      licenseSeats: {
        where: { assigned: true },
        include: { license: true },
      },
      accessoryCheckouts: {
        where: { checkedIn: null },
        include: { accessory: true },
      },
    },
  });

  if (!user) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{user.firstName} {user.lastName} <small>User Details</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/users">Users</Link></li>
          <li className="active">{user.username}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/users" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/users/${user.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
          <DeleteUserButton id={user.id} name={`${user.firstName} ${user.lastName}`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">User Information</h3>
              {user.activated ? <span className="label label-success" style={{ float: "right" }}>Active</span> : <span className="label label-danger" style={{ float: "right" }}>Inactive</span>}
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{user.firstName} {user.lastName}</strong> {user.isSuperAdmin && <span className="label label-danger">Super Admin</span>}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Username</td><td style={{ fontFamily: "monospace" }}>{user.username}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Email</td><td><a href={`mailto:${user.email}`} style={{ color: "#337ab7" }}>{user.email}</a></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Job Title</td><td>{user.jobTitle ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Employee #</td><td>{user.employeeNum ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Phone</td><td>{user.phone ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Mobile</td><td>{user.mobile ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Company</td><td>{user.company?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{user.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Department</td><td>{user.department?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manager</td><td>{user.manager ? <Link href={`/users/${user.manager.id}`} style={{ color: "#337ab7" }}>{user.manager.firstName} {user.manager.lastName}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Created</td><td style={{ fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Assets", value: user.assets.length, color: "#3c8dbc" },
                { label: "Licenses", value: user.licenseSeats.length, color: "#00a65a" },
                { label: "Accessories", value: user.accessoryCheckouts.length, color: "#f39c12" },
              ].map(s => (
                <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
                  <div className="box-body" style={{ textAlign: "center", padding: 15 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            {user.notes && (
              <div className="box box-default">
                <div className="box-header with-border"><h3 className="box-title">Notes</h3></div>
                <div className="box-body"><p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{user.notes}</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Assets */}
        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">Assigned Assets ({user.assets.length})</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            {user.assets.length === 0 ? (
              <div style={{ padding: 15, textAlign: "center", color: "#999" }}>No assets assigned.</div>
            ) : (
              <table className="table table-hover">
                <thead><tr><th>Tag</th><th>Name</th><th>Model</th><th>Status</th><th>Checkout Date</th></tr></thead>
                <tbody>
                  {user.assets.map(a => (
                    <tr key={a.id}>
                      <td><Link href={`/hardware/${a.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>{a.assetTag}</Link></td>
                      <td>{a.name ?? "—"}</td>
                      <td>{a.model?.name ?? "—"}</td>
                      <td>{a.status ? <span className="status-badge" style={{ background: a.status.color || "#777" }}>{a.status.name}</span> : "—"}</td>
                      <td style={{ fontSize: 12 }}>{a.lastCheckout ? new Date(a.lastCheckout).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* License Seats */}
        {user.licenseSeats.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Assigned Licenses ({user.licenseSeats.length})</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>License</th><th>Seat</th></tr></thead>
                <tbody>
                  {user.licenseSeats.map(ls => (
                    <tr key={ls.id}>
                      <td><Link href={`/licenses/${ls.licenseId}`} style={{ color: "#337ab7" }}>{ls.license.name}</Link></td>
                      <td>{ls.seatNum ?? "—"}</td>
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

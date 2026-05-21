import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LocationReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const locations = await prisma.location.findMany({
    where: { deletedAt: null },
    include: {
      assets: {
        where: { deletedAt: null },
        include: { status: true, model: { include: { manufacturer: true } }, assignedTo: true },
      },
      _count: { select: { assets: { where: { deletedAt: null } }, users: true } },
    },
    orderBy: [{ _count: { assets: "desc" } }, { name: "asc" }],
  });

  const totalAssets = locations.reduce((sum, l) => sum + l._count.assets, 0);

  return (
    <>
      <section className="content-header">
        <h1>Location Report <small>Assets by Location</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/reports">Reports</Link></li>
          <li className="active">Location Report</li>
        </ol>
      </section>
      <section className="content">
        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Locations", value: locations.length, color: "#3c8dbc" },
            { label: "Total Assets", value: totalAssets, color: "#00a65a" },
            { label: "Unassigned", value: locations.filter(l => l._count.assets === 0).length, color: "#f39c12" },
          ].map(s => (
            <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
              <div className="box-body" style={{ textAlign: "center", padding: "15px 10px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ float: "right", marginBottom: 16 }}>
          <Link href="/reports" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back to Reports</Link>
        </div>
        <div style={{ clear: "both" }} />

        {locations.length === 0 ? (
          <div className="box box-default">
            <div className="box-body" style={{ textAlign: "center", padding: 40, color: "#999" }}>
              No locations found. <Link href="/locations/create" style={{ color: "#337ab7" }}>Create one.</Link>
            </div>
          </div>
        ) : locations.map(location => (
          <div key={location.id} className="box box-default">
            <div className="box-header with-border" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 className="box-title">
                <Link href={`/locations/${location.id}`} style={{ color: "#337ab7" }}>{location.name}</Link>
              </h3>
              <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span className="label label-info">{location._count.assets} asset{location._count.assets !== 1 ? "s" : ""}</span>
                <span className="label label-default">{location._count.users} user{location._count.users !== 1 ? "s" : ""}</span>
                {location.city && <span style={{ color: "#777" }}>{location.city}{location.state ? `, ${location.state}` : ""}</span>}
              </div>
            </div>
            {location.assets.length > 0 && (
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Asset Tag</th>
                      <th>Name</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {location.assets.map(asset => (
                      <tr key={asset.id}>
                        <td>
                          <Link href={`/hardware/${asset.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                            {asset.assetTag}
                          </Link>
                        </td>
                        <td>{asset.name ?? "—"}</td>
                        <td>{asset.model?.name ?? "—"}</td>
                        <td>
                          {asset.status ? (
                            <span className="status-badge" style={{ background: asset.status.color || "#777" }}>
                              {asset.status.name}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          {asset.assignedTo ? (
                            <Link href={`/users/${asset.assignedTo.id}`} style={{ color: "#337ab7" }}>
                              {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                            </Link>
                          ) : <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}

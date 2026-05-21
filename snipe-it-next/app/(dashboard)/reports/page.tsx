import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { BarChart2, Download, FileText, Users, MapPin, Package } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [
    totalAssets, deployedAssets, pendingAssets, archivedAssets,
    totalLicenses, totalUsers, totalLocations,
    assetsByStatus, assetsByCategory, assetsByLocation,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, assignedToId: { not: null } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { statusType: "pending" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { statusType: "archived" } } }),
    prisma.license.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.location.count({ where: { deletedAt: null } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, include: { _count: { select: { assets: { where: { deletedAt: null } } } } } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "asset" }, include: { assetModels: { include: { _count: { select: { assets: { where: { deletedAt: null } } } } } } } }),
    prisma.location.findMany({ where: { deletedAt: null }, include: { _count: { select: { assets: { where: { deletedAt: null } } } } }, take: 10, orderBy: { assets: { _count: "desc" } } }),
  ]);

  const reportCards = [
    { title: "Asset List", desc: "Complete list of all assets", icon: <BarChart2 size={24} />, href: "/hardware", color: "#3c8dbc" },
    { title: "Activity Report", desc: "Check-in/Check-out history", icon: <FileText size={24} />, href: "/reports/activity", color: "#00a65a" },
    { title: "Undeployed Assets", desc: "Assets not currently assigned", icon: <Package size={24} />, href: "/hardware?status=deployable", color: "#f39c12" },
    { title: "User Report", desc: "Users and their assigned assets", icon: <Users size={24} />, href: "/users", color: "#605ca8" },
    { title: "Location Report", desc: "Assets by location", icon: <MapPin size={24} />, href: "/reports/location", color: "#d81b60" },
    { title: "License Report", desc: "License utilization", icon: <FileText size={24} />, href: "/licenses", color: "#00c0ef" },
  ];

  return (
    <>
      <section className="content-header">
        <h1>Reports <small>Asset Reporting</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Reports</li>
        </ol>
      </section>
      <section className="content">
        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Assets", value: totalAssets, color: "#3c8dbc" },
            { label: "Deployed", value: deployedAssets, color: "#00a65a" },
            { label: "Pending", value: pendingAssets, color: "#f39c12" },
            { label: "Archived", value: archivedAssets, color: "#777" },
            { label: "Licenses", value: totalLicenses, color: "#d81b60" },
            { label: "Users", value: totalUsers, color: "#605ca8" },
          ].map(s => (
            <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
              <div className="box-body" style={{ textAlign: "center", padding: "15px 10px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          {reportCards.map(card => (
            <Link key={card.title} href={card.href} style={{ textDecoration: "none" }}>
              <div className="box" style={{ borderTopColor: card.color, marginBottom: 0, cursor: "pointer", transition: "box-shadow .15s" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,.1)")}
              >
                <div className="box-body" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#333", fontSize: 15 }}>{card.title}</div>
                    <div style={{ color: "#777", fontSize: 13 }}>{card.desc}</div>
                  </div>
                  <Download size={14} style={{ marginLeft: "auto", color: "#ccc" }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Assets by Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Assets by Status</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Status</th><th>Type</th><th>Assets</th></tr></thead>
                <tbody>
                  {assetsByStatus.length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: "center", color: "#999" }}>No data</td></tr>
                  ) : assetsByStatus.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td><span className={`status-badge ${s.statusType === "deployable" ? "status-deployable" : s.statusType === "pending" ? "status-pending" : s.statusType === "archived" ? "status-archived" : "status-undeployable"}`}>{s.statusType}</span></td>
                      <td><strong>{s._count.assets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-success">
            <div className="box-header with-border"><h3 className="box-title">Assets by Location (Top 10)</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Location</th><th>Assets</th></tr></thead>
                <tbody>
                  {assetsByLocation.length === 0 ? (
                    <tr><td colSpan={2} style={{ textAlign: "center", color: "#999" }}>No data</td></tr>
                  ) : assetsByLocation.map(l => (
                    <tr key={l.id}>
                      <td><Link href={`/locations/${l.id}`} style={{ color: "#337ab7" }}>{l.name}</Link></td>
                      <td><strong>{l._count.assets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

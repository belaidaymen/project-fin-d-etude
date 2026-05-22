"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Laptop, FileText, Package, Cpu, Users, ShoppingCart } from "lucide-react";

interface DashboardClientProps {
  stats: {
    totalAssets: number;
    deployedAssets: number;
    undeployableAssets: number;
    pendingAssets: number;
    archivedAssets: number;
    totalLicenses: number;
    availableLicenseSeats: number;
    totalAccessories: number;
    totalConsumables: number;
    totalComponents: number;
    totalUsers: number;
  };
  recentActivity: {
    id: string;
    actionType: string;
    note: string | null;
    createdAt: string;
    user: string | null;
    admin: string | null;
    assetTag: string | null;
  }[];
  assetsByModel: { name: string; count: number }[];
  assetsByCategory: { name: string; count: number }[];
}

const PIE_COLORS = ["#00a65a", "#3c8dbc", "#f39c12", "#d9534f", "#605ca8", "#d81b60"];

export default function DashboardClient({ stats, recentActivity, assetsByModel, assetsByCategory }: DashboardClientProps) {
  const pieData = [
    { name: "Deployed", value: stats.deployedAssets },
    { name: "Available", value: stats.totalAssets - stats.deployedAssets - stats.undeployableAssets - stats.archivedAssets - stats.pendingAssets },
    { name: "Pending", value: stats.pendingAssets },
    { name: "Undeployable", value: stats.undeployableAssets },
    { name: "Archived", value: stats.archivedAssets },
  ].filter(d => d.value > 0);

  const tiles = [
    { label: "Total Assets", value: stats.totalAssets, href: "/hardware", color: "bg-light-blue", icon: <Laptop size={60} />, footer: "View all assets" },
    { label: "Licenses", value: stats.totalLicenses, href: "/licenses", color: "bg-maroon", icon: <FileText size={60} />, footer: "View all licenses" },
    { label: "Accessories", value: stats.totalAccessories, href: "/accessories", color: "bg-teal", icon: <Package size={60} />, footer: "View all accessories" },
    { label: "Consumables", value: stats.totalConsumables, href: "/consumables", color: "bg-orange", icon: <ShoppingCart size={60} />, footer: "View all consumables" },
    { label: "Components", value: stats.totalComponents, href: "/components", color: "bg-purple", icon: <Cpu size={60} />, footer: "View all components" },
    { label: "Users", value: stats.totalUsers, href: "/users", color: "bg-yellow", icon: <Users size={60} />, footer: "View all users" },
  ];

  return (
    <>
      <section className="content-header">
        <h1>Dashboard <small>Control Panel</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Dashboard</li>
        </ol>
      </section>

      <section className="content">
        {/* Stat tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
          {tiles.map(tile => (
            <Link key={tile.href} href={tile.href} className={`small-box ${tile.color}`}>
              <div className="inner">
                <h3>{tile.value.toLocaleString()}</h3>
                <p>{tile.label}</p>
              </div>
              <div className="icon" style={{ color: "rgba(0,0,0,.15)" }}>{tile.icon}</div>
              <span className="small-box-footer">
                {tile.footer} &raquo;
              </span>
            </Link>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Asset Status Chart */}
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">Asset Status Overview</h3>
            </div>
            <div className="box-body" style={{ height: 280 }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                  No assets found
                </div>
              )}
            </div>
          </div>

          {/* Assets by Model */}
          <div className="box box-success">
            <div className="box-header with-border">
              <h3 className="box-title">Assets by Model</h3>
            </div>
            <div className="box-body" style={{ height: 280 }}>
              {assetsByModel.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assetsByModel} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00a65a" name="Assets" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                  No models found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Deployed Assets", value: stats.deployedAssets, color: "#00a65a" },
            { label: "Available Licenses", value: stats.availableLicenseSeats, color: "#3c8dbc" },
            { label: "Pending Assets", value: stats.pendingAssets, color: "#f39c12" },
            { label: "Undeployable", value: stats.undeployableAssets, color: "#d9534f" },
          ].map(s => (
            <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
              <div className="box-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 15 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Recent Activity</h3>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#999" }}>No recent activity</div>
            ) : (
              <table className="table table-hover" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Asset</th>
                    <th>User</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(a => (
                    <tr key={a.id}>
                      <td>
                        <span className={`label ${
                          a.actionType === "checkout" ? "label-success" :
                          a.actionType === "checkin" ? "label-info" :
                          a.actionType === "update" ? "label-warning" :
                          "label-default"
                        }`}>
                          {a.actionType}
                        </span>
                      </td>
                      <td>{a.assetTag ?? "—"}</td>
                      <td>{a.user ?? "—"}</td>
                      <td>{a.admin ?? "—"}</td>
                      <td style={{ color: "#777", fontSize: 12 }}>
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

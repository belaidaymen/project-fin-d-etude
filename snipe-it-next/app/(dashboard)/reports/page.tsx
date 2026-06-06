import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { BarChart2, FileText, Users, MapPin, Package } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [
    totalAssets, totalUsers, totalLocations, totalMovements, totalDemandes,
    assetsByStatus, assetsByLocation, assetsByCategory,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.location.count({ where: { deletedAt: null } }),
    prisma.equipmentMovement.count(),
    prisma.equipmentRequest.count(),
    prisma.statuslabel.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
    }),
    prisma.location.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
      orderBy: { assets: { _count: "desc" } },
      take: 10,
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
      orderBy: { assets: { _count: "desc" } },
      take: 10,
    }),
  ]);

  const reportCards = [
    { title: "Liste des équipements", desc: "Inventaire complet du matériel", icon: <BarChart2 size={24} />, href: "/hardware", color: "#3c8dbc" },
    { title: "Rapport d'activité", desc: "Historique des mouvements", icon: <FileText size={24} />, href: "/reports/activity", color: "#00a65a" },
    { title: "Équipements disponibles", desc: "Matériel au statut Disponible", icon: <Package size={24} />, href: "/hardware?status=Disponible", color: "#f39c12" },
    { title: "Rapport utilisateurs", desc: "Utilisateurs et leurs équipements", icon: <Users size={24} />, href: "/users", color: "#605ca8" },
    { title: "Rapport par localisation", desc: "Équipements par local / labo", icon: <MapPin size={24} />, href: "/reports/location", color: "#d81b60" },
    { title: "Demandes d'équipements", desc: "Suivi des demandes d'achat / réforme", icon: <FileText size={24} />, href: "/logistique/demandes", color: "#00c0ef" },
  ];

  return (
    <>
      <section className="content-header">
        <h1>Rapports <small>Statistiques & Analyses</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Accueil</a></li>
          <li className="active">Rapports</li>
        </ol>
      </section>
      <section className="content">
        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total équipements", value: totalAssets, color: "#3c8dbc" },
            { label: "Utilisateurs", value: totalUsers, color: "#605ca8" },
            { label: "Emplacements", value: totalLocations, color: "#d81b60" },
            { label: "Mouvements", value: totalMovements, color: "#00a65a" },
            { label: "Demandes", value: totalDemandes, color: "#f39c12" },
          ].map(s => (
            <div key={s.label} className="box" style={{ borderTopColor: s.color, marginBottom: 0 }}>
              <div className="box-body" style={{ textAlign: "center", padding: "15px 10px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value.toLocaleString("fr-FR")}</div>
                <div style={{ fontSize: 13, color: "#777" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Report Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          {reportCards.map(card => (
            <Link key={card.title} href={card.href} style={{ textDecoration: "none" }}>
              <div className="box" style={{ borderTopColor: card.color, marginBottom: 0, cursor: "pointer" }}>
                <div className="box-body" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                  <div style={{ color: card.color }}>{card.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "#333", fontSize: 15 }}>{card.title}</div>
                    <div style={{ color: "#777", fontSize: 13 }}>{card.desc}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Assets by Status & Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Équipements par état</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>État</th><th>Équipements</th></tr></thead>
                <tbody>
                  {assetsByStatus.length === 0 ? (
                    <tr><td colSpan={2} style={{ textAlign: "center", color: "#999" }}>Aucune donnée</td></tr>
                  ) : assetsByStatus.map(s => (
                    <tr key={s.id}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color ?? "#888", flexShrink: 0 }} />
                          {s.name}
                        </span>
                      </td>
                      <td><strong>{s._count.assets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-success">
            <div className="box-header with-border"><h3 className="box-title">Équipements par catégorie</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Catégorie</th><th>Équipements</th></tr></thead>
                <tbody>
                  {assetsByCategory.length === 0 ? (
                    <tr><td colSpan={2} style={{ textAlign: "center", color: "#999" }}>Aucune donnée</td></tr>
                  ) : assetsByCategory.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td><strong>{c._count.assets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-info">
            <div className="box-header with-border"><h3 className="box-title">Top 10 emplacements</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Emplacement</th><th>Équipements</th></tr></thead>
                <tbody>
                  {assetsByLocation.length === 0 ? (
                    <tr><td colSpan={2} style={{ textAlign: "center", color: "#999" }}>Aucune donnée</td></tr>
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

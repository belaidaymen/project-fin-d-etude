import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Package, ArrowDownCircle, ArrowUpCircle, RefreshCw, Plus, ArrowRight } from "lucide-react";

export default async function MagasinierDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "MAGASINIER") redirect("/dashboard");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalEquipements,
    enStock,
    entreesTotal,
    sortiesTotal,
    transfertsTotal,
    derniersMouvements,
    equipementsRecents,
    equipParStatus,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "En stock" } } }),
    prisma.equipmentMovement.count({ where: { type: "ENTREE", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.equipmentMovement.count({ where: { type: "SORTIE", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.equipmentMovement.count({ where: { type: "TRANSFERT", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.equipmentMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { asset: true, fromLocation: true, toLocation: true, doneBy: true },
    }),
    prisma.asset.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, location: true, status: true },
    }),
    prisma.statuslabel.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
    }),
  ]);

  const typeLabel: Record<string, string> = { ENTREE: "Entrée", SORTIE: "Sortie", TRANSFERT: "Transfert" };
  const typeColor: Record<string, string> = { ENTREE: "#00a65a", SORTIE: "#d9534f", TRANSFERT: "#3c8dbc" };
  const typeIcon: Record<string, React.ReactNode> = {
    ENTREE: <ArrowDownCircle size={14} />,
    SORTIE: <ArrowUpCircle size={14} />,
    TRANSFERT: <RefreshCw size={14} />,
  };

  const kpis = [
    { label: "Total équipements", value: totalEquipements, icon: <Package size={22} />, color: "#3c8dbc", bg: "#e8f4fb" },
    { label: "En stock (magasin)", value: enStock, icon: <Package size={22} />, color: "#00a65a", bg: "#e6f9f0" },
    { label: "Entrées (30j)", value: entreesTotal, icon: <ArrowDownCircle size={22} />, color: "#00a65a", bg: "#e6f9f0" },
    { label: "Sorties (30j)", value: sortiesTotal, icon: <ArrowUpCircle size={22} />, color: "#d9534f", bg: "#fde8e8" },
  ];

  return (
    <div>
      <div style={{ background: "#00a65a", padding: "20px 24px 60px", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 300 }}>
          <b style={{ fontWeight: 700 }}>Tableau de bord</b> — Magasinier
        </h1>
        <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
          Gestion des entrées, sorties et mouvements d'équipements
        </p>
      </div>

      <div style={{ padding: "0 24px 24px", marginTop: -40 }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {kpis.map(k => (
            <div key={k.label} style={{
              background: "#fff", borderRadius: 8, padding: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#333", lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#fff", borderRadius: 8, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,.08)", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 600, color: "#333" }}>Actions rapides</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/magasinier/equipements?action=new" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              background: "#00a65a", color: "white", borderRadius: 6, textDecoration: "none",
              fontSize: 13, fontWeight: 600,
            }}>
              <Plus size={15} /> Enregistrer un équipement
            </Link>
            <Link href="/magasinier/mouvements?action=new" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              background: "#3c8dbc", color: "white", borderRadius: 6, textDecoration: "none",
              fontSize: 13, fontWeight: 600,
            }}>
              <ArrowDownCircle size={15} /> Créer un mouvement
            </Link>
            <Link href="/magasinier/equipements" style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              background: "#f8f9fa", color: "#555", borderRadius: 6, textDecoration: "none",
              fontSize: 13, fontWeight: 600, border: "1px solid #e0e0e0",
            }}>
              <Package size={15} /> Voir tous les équipements
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          {/* Last movements */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Derniers mouvements</h3>
              <Link href="/magasinier/mouvements" style={{ fontSize: 12, color: "#00a65a", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            <div>
              {derniersMouvements.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucun mouvement enregistré</div>
              ) : derniersMouvements.map(m => (
                <div key={m.id} style={{ padding: "11px 18px", borderBottom: "1px solid #f8f8f8", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: (typeColor[m.type] ?? "#888") + "18",
                    color: typeColor[m.type] ?? "#888", flexShrink: 0, minWidth: 80,
                  }}>
                    {typeIcon[m.type]} {typeLabel[m.type] ?? m.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{m.asset.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {m.fromLocation?.name && m.toLocation?.name
                        ? `${m.fromLocation.name} → ${m.toLocation.name}`
                        : m.fromLocation?.name
                        ? `Départ: ${m.fromLocation.name}`
                        : m.toLocation?.name
                        ? `Arrivée: ${m.toLocation.name}`
                        : m.note ?? "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{new Date(m.createdAt).toLocaleDateString("fr-FR")}</div>
                    {m.reference && <div style={{ fontSize: 10, color: "#bbb" }}>{m.reference}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>État du parc</h3>
            </div>
            <div style={{ padding: "12px 18px" }}>
              {equipParStatus.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color ?? "#888", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#555" }}>{s.name}</span>
                  <span style={{
                    fontWeight: 700, fontSize: 14, color: "#333",
                    minWidth: 28, textAlign: "right",
                  }}>{s._count.assets}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 18px", borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: "#555" }}>Total</span>
                <span style={{ color: "#333" }}>{totalEquipements}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

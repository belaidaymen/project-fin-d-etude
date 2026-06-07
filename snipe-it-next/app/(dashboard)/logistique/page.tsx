import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Package, CheckCircle, AlertTriangle, Clock, ClipboardList, ArrowRight } from "lucide-react";

export default async function LogistiqueDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LOGISTIQUE") redirect("/dashboard");

  const [
    totalEquipements,
    enService,
    enPanne,
    enMaintenance,
    enStock,
    reformes,
    demandesEnAttente,
    demandesTotal,
    totalLabs,
    derniersMouvements,
    equipParCategorie,
    equipParLabo,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "En service" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "Hors service" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "En maintenance" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "Disponible" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { name: "Réservé" } } }),
    prisma.equipmentRequest.count({ where: { status: "EN_ATTENTE" } }),
    prisma.equipmentRequest.count(),
    prisma.location.count({ where: { type: "LABORATOIRE", deletedAt: null } }),
    prisma.equipmentMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { asset: true, fromLocation: true, toLocation: true, doneBy: true },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
      orderBy: { assets: { _count: "desc" } },
      take: 6,
    }),
    prisma.location.findMany({
      where: { type: "LABORATOIRE", deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
      orderBy: { assets: { _count: "desc" } },
    }),
  ]);

  const [demandesRecentes, demandesParType] = await Promise.all([
    prisma.equipmentRequest.findMany({
      where: { status: "EN_ATTENTE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { requester: true, laboratoire: true },
    }),
    prisma.equipmentRequest.groupBy({
      by: ["type"],
      where: { status: "EN_ATTENTE" },
      _count: { id: true },
    }),
  ]);

  const kpis = [
    { label: "Total Équipements", value: totalEquipements, icon: <Package size={24} />, color: "#3c8dbc", bg: "#e8f4fb" },
    { label: "En Service", value: enService, icon: <CheckCircle size={24} />, color: "#00a65a", bg: "#e6f9f0" },
    { label: "Hors Service", value: enPanne, icon: <AlertTriangle size={24} />, color: "#d9534f", bg: "#fde8e8" },
    { label: "Demandes en attente", value: demandesEnAttente, icon: <ClipboardList size={24} />, color: "#f39c12", bg: "#fef6e6" },
  ];

  const typeLabel: Record<string, string> = { ENTREE: "Entrée", SORTIE: "Sortie", TRANSFERT: "Transfert" };
  const typeColor: Record<string, string> = { ENTREE: "#00a65a", SORTIE: "#d9534f", TRANSFERT: "#3c8dbc" };
  const urgenceColor: Record<string, string> = { HAUTE: "#d9534f", NORMALE: "#f39c12", BASSE: "#777" };
  const demandeTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
    ACHAT: { label: "Achat", color: "#3c8dbc", bg: "#e8f4fb" },
    REMPLACEMENT: { label: "Remplacement", color: "#e67e22", bg: "#fef0e6" },
    REFORME: { label: "Réforme", color: "#8e44ad", bg: "#f5eef8" },
  };
  const demandesTypeSummary = Object.fromEntries(demandesParType.map(d => [d.type, d._count.id]));

  return (
    <div style={{ padding: 0 }}>
      <div style={{ background: "#3c8dbc", padding: "20px 24px 60px", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 300 }}>
          <b style={{ fontWeight: 700 }}>Tableau de bord</b> — Responsable Logistique
        </h1>
        <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: 14 }}>
          Vue globale de l'inventaire et des actifs de l'établissement
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
              <div style={{ width: 52, height: 52, borderRadius: 10, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", color: k.color, flexShrink: 0 }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#333", lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Répartition par laboratoire */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Équipements par laboratoire</h3>
              <span style={{ fontSize: 12, color: "#888" }}>{totalLabs} laboratoires</span>
            </div>
            <div style={{ padding: "12px 18px" }}>
              {equipParLabo.map(lab => {
                const pct = totalEquipements > 0 ? Math.round((lab._count.assets / totalEquipements) * 100) : 0;
                return (
                  <div key={lab.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "#444" }}>{lab.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{lab._count.assets}</span>
                    </div>
                    <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#3c8dbc", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* État général */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>État général des équipements</h3>
            </div>
            <div style={{ padding: "16px 18px" }}>
              {[
                { label: "En service", value: enService, color: "#00a65a" },
                { label: "Hors service", value: enPanne, color: "#d9534f" },
                { label: "En maintenance", value: enMaintenance, color: "#f0ad4e" },
                { label: "Disponible", value: enStock, color: "#337ab7" },
                { label: "Réservé", value: reformes, color: "#9b59b6" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#555" }}>{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: "#aaa", width: 36, textAlign: "right" }}>
                    {totalEquipements > 0 ? Math.round((s.value / totalEquipements) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Demandes en attente */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>
                Demandes en attente
                {demandesEnAttente > 0 && (
                  <span style={{ marginLeft: 8, background: "#d9534f", color: "white", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>
                    {demandesEnAttente}
                  </span>
                )}
              </h3>
              <Link href="/logistique/demandes" style={{ fontSize: 12, color: "#3c8dbc", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ padding: "8px 0" }}>
              {demandesRecentes.length === 0 ? (
                <div style={{ padding: "20px 18px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                  Aucune demande en attente
                </div>
              ) : demandesRecentes.map(d => {
                const dtc = demandeTypeConfig[d.type] ?? demandeTypeConfig.ACHAT;
                return (
                  <div key={d.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8f8f8", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ padding: "1px 7px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: dtc.bg, color: dtc.color, textTransform: "uppercase" }}>
                          {dtc.label}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{d.title}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {d.laboratoire?.name} — {d.requester.firstName} {d.requester.lastName}
                      </div>
                    </div>
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: (urgenceColor[d.urgency] ?? "#777") + "18",
                      color: urgenceColor[d.urgency] ?? "#777",
                      flexShrink: 0,
                    }}>
                      {d.urgency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Derniers mouvements */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Derniers mouvements</h3>
            </div>
            <div style={{ padding: "8px 0" }}>
              {derniersMouvements.length === 0 ? (
                <div style={{ padding: "20px 18px", textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucun mouvement enregistré</div>
              ) : derniersMouvements.map(m => (
                <div key={m.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8f8f8", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: (typeColor[m.type] ?? "#888") + "18",
                    color: typeColor[m.type] ?? "#888", flexShrink: 0,
                  }}>
                    {typeLabel[m.type] ?? m.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{m.asset.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {m.reference && `${m.reference} — `}{m.doneBy.firstName} {m.doneBy.lastName}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>
                    {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

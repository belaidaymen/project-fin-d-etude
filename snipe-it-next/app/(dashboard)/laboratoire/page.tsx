import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Package, CheckCircle, AlertTriangle, FileText, Plus, ArrowRight } from "lucide-react";

export default async function LaboManagerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LABORATOIRE") redirect("/dashboard");

  const laboratoireId = (session.user as any).laboratoireId;
  if (!laboratoireId) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
        <AlertTriangle size={48} style={{ color: "#f0ad4e", marginBottom: 16 }} />
        <h2>Aucun laboratoire associé</h2>
        <p>Votre compte n'est pas associé à un laboratoire. Contactez l'administrateur.</p>
      </div>
    );
  }

  const [laboratoire, totalEquipements, enService, enPanne, enMaintenance, mesDemandesEnAttente, dernieresDemandesRaw, derniersEquipementsRaw] = await Promise.all([
    prisma.location.findUnique({ where: { id: laboratoireId } }),
    prisma.asset.count({ where: { locationId: laboratoireId, deletedAt: null } }),
    prisma.asset.count({ where: { locationId: laboratoireId, deletedAt: null, status: { name: "En service" } } }),
    prisma.asset.count({ where: { locationId: laboratoireId, deletedAt: null, status: { name: "Hors service" } } }),
    prisma.asset.count({ where: { locationId: laboratoireId, deletedAt: null, status: { name: "En maintenance" } } }),
    prisma.equipmentRequest.count({ where: { laboratoireId, status: "EN_ATTENTE" } }),
    prisma.equipmentRequest.findMany({
      where: { laboratoireId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.asset.findMany({
      where: { locationId: laboratoireId, deletedAt: null },
      include: { category: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  const disponibilite = totalEquipements > 0 ? Math.round((enService / totalEquipements) * 100) : 0;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    EN_ATTENTE: { label: "En attente", color: "#f39c12", bg: "#fef6e6" },
    APPROUVEE: { label: "Approuvée", color: "#00a65a", bg: "#e6f9f0" },
    REJETEE: { label: "Rejetée", color: "#d9534f", bg: "#fde8e8" },
  };

  return (
    <div>
      <div style={{ background: "#f39c12", padding: "20px 24px 60px", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 300 }}>
          <b style={{ fontWeight: 700 }}>Tableau de bord</b> — Responsable Laboratoire
        </h1>
        <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 14 }}>
          {laboratoire?.name ?? "Mon laboratoire"}
        </p>
      </div>

      <div style={{ padding: "0 24px 24px", marginTop: -40 }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Équipements affectés", value: totalEquipements, icon: <Package size={22} />, color: "#f39c12", bg: "#fef6e6" },
            { label: "En service", value: enService, icon: <CheckCircle size={22} />, color: "#00a65a", bg: "#e6f9f0" },
            { label: "En panne / Maint.", value: enPanne + enMaintenance, icon: <AlertTriangle size={22} />, color: "#d9534f", bg: "#fde8e8" },
            { label: "Mes demandes (att.)", value: mesDemandesEnAttente, icon: <FileText size={22} />, color: "#3c8dbc", bg: "#e8f4fb" },
          ].map(k => (
            <div key={k.label} style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.08)", display: "flex", alignItems: "center", gap: 16 }}>
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

        {/* Disponibilité */}
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.08)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Taux de disponibilité du laboratoire</h3>
            <span style={{ fontSize: 20, fontWeight: 700, color: disponibilite >= 70 ? "#00a65a" : disponibilite >= 40 ? "#f39c12" : "#d9534f" }}>
              {disponibilite}%
            </span>
          </div>
          <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 5,
              width: `${disponibilite}%`,
              background: disponibilite >= 70 ? "#00a65a" : disponibilite >= 40 ? "#f39c12" : "#d9534f",
              transition: "width .5s",
            }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 12, color: "#777" }}>
            <span><span style={{ color: "#00a65a", fontWeight: 600 }}>{enService}</span> en service</span>
            <span><span style={{ color: "#d9534f", fontWeight: 600 }}>{enPanne}</span> en panne</span>
            <span><span style={{ color: "#f0ad4e", fontWeight: 600 }}>{enMaintenance}</span> en maintenance</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Recent equipment */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Mes équipements</h3>
              <Link href="/laboratoire/equipements" style={{ fontSize: 12, color: "#f39c12", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Voir tout <ArrowRight size={12} />
              </Link>
            </div>
            <div>
              {derniersEquipementsRaw.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "#aaa", fontSize: 13 }}>Aucun équipement affecté</div>
              ) : derniersEquipementsRaw.map((a, i) => (
                <div key={a.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8f8f8", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>{a.assetTag} {a.category && `— ${a.category.name}`}</div>
                  </div>
                  {a.status && (
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: (a.status.color ?? "#888") + "20", color: a.status.color ?? "#888",
                      flexShrink: 0,
                    }}>
                      {a.status.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My requests */}
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Mes dernières demandes</h3>
              <Link href="/laboratoire/demandes" style={{ fontSize: 12, color: "#f39c12", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={12} /> Nouvelle demande
              </Link>
            </div>
            <div>
              {dernieresDemandesRaw.length === 0 ? (
                <div style={{ padding: "24px 18px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                  Aucune demande formulée
                </div>
              ) : dernieresDemandesRaw.map(d => {
                const sc = statusConfig[d.status] ?? statusConfig.EN_ATTENTE;
                return (
                  <div key={d.id} style={{ padding: "10px 18px", borderBottom: "1px solid #f8f8f8", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>
                        {new Date(d.createdAt).toLocaleDateString("fr-FR")} — Qté: {d.quantity}
                      </div>
                    </div>
                    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: sc.bg, color: sc.color, flexShrink: 0 }}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { AlertTriangle } from "lucide-react";

export default async function LaboEquipementsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LABORATOIRE") redirect("/dashboard");

  const laboratoireId = (session.user as any).laboratoireId;

  if (!laboratoireId) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
        <AlertTriangle size={48} style={{ color: "#f0ad4e", marginBottom: 16 }} />
        <h2>Aucun laboratoire associé à votre compte.</h2>
      </div>
    );
  }

  const [laboratoire, assets] = await Promise.all([
    prisma.location.findUnique({ where: { id: laboratoireId } }),
    prisma.asset.findMany({
      where: { locationId: laboratoireId, deletedAt: null },
      include: { category: true, status: true },
      orderBy: [{ status: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  const enService = assets.filter(a => a.status?.name === "En service").length;
  const enPanne = assets.filter(a => a.status?.name === "En panne").length;
  const enMaintenance = assets.filter(a => a.status?.name === "En maintenance").length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>
          Équipements — {laboratoire?.name ?? "Mon Laboratoire"}
        </h2>
        <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>
          {assets.length} équipement{assets.length !== 1 ? "s" : ""} affecté{assets.length !== 1 ? "s" : ""} à ce laboratoire
        </p>
      </div>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "En service", count: enService, color: "#00a65a" },
          { label: "En panne", count: enPanne, color: "#d9534f" },
          { label: "En maintenance", count: enMaintenance, color: "#f0ad4e" },
        ].map(s => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
            background: "#fff", borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,.08)",
            border: `2px solid ${s.color}30`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#333" }}>{s.count}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                {["Tag", "Nom", "Référence", "N° Série", "Catégorie", "État", "Disponibilité"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 14px", textAlign: "center", color: "#aaa" }}>
                    Aucun équipement affecté à ce laboratoire
                  </td>
                </tr>
              ) : assets.map((a, i) => {
                const isAvailable = a.status?.name === "En service";
                const statusColor = a.status?.color ?? "#888";
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#f39c12", fontWeight: 600 }}>{a.assetTag}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#333" }}>{a.name}</td>
                    <td style={{ padding: "10px 14px", color: "#777" }}>{a.reference ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#777", fontFamily: "monospace", fontSize: 11 }}>{a.serial ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#777" }}>{a.category?.name ?? "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {a.status ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: statusColor + "20", color: statusColor,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                          {a.status.name}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: isAvailable ? "#e6f9f0" : "#fff5e6",
                        color: isAvailable ? "#00a65a" : "#e67e22",
                      }}>
                        {isAvailable ? "✓ Disponible" : "✗ Indisponible"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

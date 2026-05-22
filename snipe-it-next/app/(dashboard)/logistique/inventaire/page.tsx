import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";

export default async function InventairePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; loc?: string; status?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role !== "LOGISTIQUE") redirect("/dashboard");

  const params = await searchParams;
  const { cat, loc, status, q } = params;

  const where: any = { deletedAt: null };
  if (cat) where.categoryId = cat;
  if (loc) where.locationId = loc;
  if (status) where.statusId = status;
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { assetTag: { contains: q, mode: "insensitive" } },
    { reference: { contains: q, mode: "insensitive" } },
    { serial: { contains: q, mode: "insensitive" } },
  ];

  const [assets, categories, locations, statuses] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { category: true, location: true, status: true },
      orderBy: { assetTag: "asc" },
    }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Inventaire Global des Équipements</h2>
        <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>
          Suivi de l'état, de la localisation et de l'affectation du matériel —{" "}
          <b style={{ color: "#3c8dbc" }}>{assets.length}</b> équipement{assets.length !== 1 ? "s" : ""} trouvé{assets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <form method="GET" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher par nom, tag, référence..."
          className="form-control"
          style={{ maxWidth: 260 }}
        />
        <select name="cat" defaultValue={cat ?? ""} className="form-control" style={{ maxWidth: 180 }}>
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="loc" defaultValue={loc ?? ""} className="form-control" style={{ maxWidth: 220 }}>
          <option value="">Tous les locaux</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} className="form-control" style={{ maxWidth: 180 }}>
          <option value="">Tous les états</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Filtrer</button>
        <a href="/logistique/inventaire" className="btn btn-default">Réinitialiser</a>
      </form>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                {["Tag", "Désignation", "Référence", "Catégorie", "Affectation / Localisation", "Qté", "État", "Date d'achat"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "32px 14px", textAlign: "center", color: "#aaa" }}>
                    Aucun équipement trouvé
                  </td>
                </tr>
              ) : assets.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#3c8dbc", fontWeight: 600 }}>{a.assetTag}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#333" }}>{a.name}</td>
                  <td style={{ padding: "10px 14px", color: "#666" }}>{a.reference ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#666" }}>{a.category?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#666" }}>{a.location?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#666", textAlign: "center" }}>{a.quantity}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {a.status ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: (a.status.color ?? "#888") + "20",
                        color: a.status.color ?? "#888",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.status.color ?? "#888", display: "inline-block" }} />
                        {a.status.name}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#888" }}>
                    {a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

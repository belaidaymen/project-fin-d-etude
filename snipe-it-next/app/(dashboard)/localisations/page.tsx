import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { SALLE: "Salle", LABORATOIRE: "Laboratoire", SERVICE: "Service", ENTREPOT: "Entrepôt" };
const TYPE_COLORS: Record<string, string> = { SALLE: "#3c8dbc", LABORATOIRE: "#00a65a", SERVICE: "#f39c12", ENTREPOT: "#605ca8" };

export default async function LocalisationsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const search = searchParams?.search ?? "";
  const type = searchParams?.type ?? "";

  const where: any = {};
  if (type) where.type = type;
  if (search) where.OR = [{ nom: { contains: search, mode: "insensitive" } }, { batiment: { contains: search, mode: "insensitive" } }];

  const items = await prisma.localisation.findMany({ where, include: { _count: { select: { affectations: true } } }, orderBy: [{ type: "asc" }, { nom: "asc" }] });
  const canEdit = ["ADMIN", "LOGISTICIEN"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Localisations <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Salles, Laboratoires, Services</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Localisations</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Liste des localisations ({items.length})</h3>
            {canEdit && <Link href="/localisations/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouvelle localisation</Link>}
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <input name="search" className="form-control" style={{ width: 240 }} placeholder="Rechercher..." defaultValue={search} />
              <select name="type" className="form-control" style={{ width: 180 }} defaultValue={type}>
                <option value="">Tous les types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="submit" className="btn btn-default">Filtrer</button>
              {(search || type) && <Link href="/localisations" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Nom</th>
                    <th style={{ padding: "10px 12px" }}>Type</th>
                    <th style={{ padding: "10px 12px" }}>Bâtiment / Étage</th>
                    <th style={{ padding: "10px 12px" }}>Capacité</th>
                    <th style={{ padding: "10px 12px" }}>Équipements affectés</th>
                    <th style={{ padding: "10px 12px" }}>Statut</th>
                    <th style={{ padding: "10px 12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucune localisation trouvée.</td></tr>}
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                        <Link href={`/localisations/${item.id}`} style={{ color: "#3c8dbc", textDecoration: "none" }}>{item.nom}</Link>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: (TYPE_COLORS[item.type] ?? "#ccc") + "22", color: TYPE_COLORS[item.type] ?? "#333", fontWeight: 600 }}>
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{[item.batiment, item.etage].filter(Boolean).join(" — ") || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.capacite ?? "—"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, padding: "2px 8px", background: "#f4f4f4", borderRadius: 10 }}>{item._count.affectations}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: item.actif ? "#00a65a22" : "#77777722", color: item.actif ? "#00a65a" : "#777", fontWeight: 600 }}>
                          {item.actif ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <Link href={`/localisations/${item.id}`} className="btn btn-default btn-xs">Voir</Link>
                          {canEdit && <Link href={`/localisations/${item.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>}
                        </div>
                      </td>
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

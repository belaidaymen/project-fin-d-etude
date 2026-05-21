import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AffectationsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const actifFilter = searchParams?.actif ?? "true";

  const where: any = {};
  if (actifFilter !== "all") where.actif = actifFilter === "true";

  const [items, total] = await Promise.all([
    prisma.affectation.findMany({ where, include: { equipement: { include: { categorie: true } }, localisation: true, createdPar: true }, orderBy: { dateAffectation: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.affectation.count({ where }),
  ]);
  const totalPages = Math.ceil(total / perPage);
  const canEdit = ["ADMIN", "LOGISTICIEN", "MAGASINIER"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Affectations <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Équipements assignés aux localisations</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Affectations</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Liste des affectations ({total})</h3>
            {canEdit && <Link href="/affectations/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouvelle affectation</Link>}
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8 }}>
              <select name="actif" className="form-control" style={{ width: 200 }} defaultValue={actifFilter}>
                <option value="all">Toutes les affectations</option>
                <option value="true">Affectations actives</option>
                <option value="false">Affectations terminées</option>
              </select>
              <button type="submit" className="btn btn-default">Filtrer</button>
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Équipement</th>
                    <th style={{ padding: "10px 12px" }}>Localisation</th>
                    <th style={{ padding: "10px 12px" }}>Quantité</th>
                    <th style={{ padding: "10px 12px" }}>Date affectation</th>
                    <th style={{ padding: "10px 12px" }}>Date fin</th>
                    <th style={{ padding: "10px 12px" }}>Par</th>
                    <th style={{ padding: "10px 12px" }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucune affectation trouvée.</td></tr>}
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 12px" }}>
                        <Link href={`/equipements/${item.equipement.id}`} style={{ color: "#3c8dbc", textDecoration: "none", fontWeight: 500 }}>{item.equipement.nom}</Link>
                        <div style={{ fontSize: 11, color: "#999", fontFamily: "monospace" }}>{item.equipement.reference}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Link href={`/localisations/${item.localisation.id}`} style={{ color: "#555", textDecoration: "none" }}>{item.localisation.nom}</Link>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.quantite}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{new Date(item.dateAffectation).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{item.dateFin ? new Date(item.dateFin).toLocaleDateString("fr-FR") : "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{item.createdPar.prenom} {item.createdPar.nom}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: item.actif ? "#00a65a22" : "#77777722", color: item.actif ? "#00a65a" : "#777", fontWeight: 600 }}>{item.actif ? "Active" : "Terminée"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/affectations?actif=${actifFilter}&page=${page - 1}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={`/affectations?actif=${actifFilter}&page=${p}`}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={`/affectations?actif=${actifFilter}&page=${page + 1}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

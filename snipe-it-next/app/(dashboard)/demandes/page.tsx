import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

const STATUT_COLORS: Record<string, string> = { EN_ATTENTE: "#f39c12", EN_COURS: "#00c0ef", APPROUVEE: "#00a65a", REJETEE: "#dd4b39", CLOTUREE: "#605ca8" };
const PRIORITE_COLORS: Record<string, string> = { BASSE: "#aaa", NORMALE: "#3c8dbc", HAUTE: "#f39c12", URGENTE: "#dd4b39" };
const TYPE_LABELS: Record<string, string> = { ACHAT: "Achat", REMPLACEMENT: "Remplacement", REFORME: "Réforme", MAINTENANCE: "Maintenance" };

export default async function DemandesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const userId = Number((session.user as any).id);
  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const statut = searchParams?.statut ?? "";
  const type = searchParams?.type ?? "";

  const where: any = {};
  if (statut) where.statut = statut;
  if (type) where.type = type;
  if (role === "CHEF_LABO") where.createdParId = userId;

  const [items, total] = await Promise.all([
    prisma.demande.findMany({ where, include: { createdPar: true, equipement: { select: { id: true, nom: true, reference: true } }, validatePar: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.demande.count({ where }),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Demandes <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Achats, remplacements, réformes</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Demandes</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Liste des demandes ({total})</h3>
            <Link href="/demandes/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouvelle demande</Link>
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8 }}>
              <select name="statut" className="form-control" style={{ width: 200 }} defaultValue={statut}>
                <option value="">Tous les statuts</option>
                {["EN_ATTENTE", "EN_COURS", "APPROUVEE", "REJETEE", "CLOTUREE"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
              <select name="type" className="form-control" style={{ width: 180 }} defaultValue={type}>
                <option value="">Tous les types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="submit" className="btn btn-default">Filtrer</button>
              {(statut || type) && <Link href="/demandes" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Titre</th>
                    <th style={{ padding: "10px 12px" }}>Type</th>
                    <th style={{ padding: "10px 12px" }}>Priorité</th>
                    <th style={{ padding: "10px 12px" }}>Statut</th>
                    <th style={{ padding: "10px 12px" }}>Demandeur</th>
                    <th style={{ padding: "10px 12px" }}>Date</th>
                    <th style={{ padding: "10px 12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucune demande trouvée.</td></tr>}
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 12px" }}>
                        <Link href={`/demandes/${item.id}`} style={{ color: "#3c8dbc", textDecoration: "none", fontWeight: 500 }}>{item.titre}</Link>
                        {item.equipement && <div style={{ fontSize: 11, color: "#999" }}>{item.equipement.reference} — {item.equipement.nom}</div>}
                      </td>
                      <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 12, padding: "2px 7px", borderRadius: 10, background: "#3c8dbc22", color: "#3c8dbc" }}>{TYPE_LABELS[item.type] ?? item.type}</span></td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: (PRIORITE_COLORS[item.priorite] ?? "#ccc") + "22", color: PRIORITE_COLORS[item.priorite] ?? "#333", fontWeight: 600 }}>{item.priorite}</span>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: (STATUT_COLORS[item.statut] ?? "#ccc") + "22", color: STATUT_COLORS[item.statut] ?? "#333", fontWeight: 600 }}>{item.statut.replace(/_/g, " ")}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{item.createdPar.prenom} {item.createdPar.nom}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <Link href={`/demandes/${item.id}`} className="btn btn-default btn-xs">Voir</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/demandes?statut=${statut}&type=${type}&page=${page - 1}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={`/demandes?statut=${statut}&type=${type}&page=${p}`}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={`/demandes?statut=${statut}&type=${type}&page=${page + 1}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

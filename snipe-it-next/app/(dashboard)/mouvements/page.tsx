import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

const TYPE_LABELS: Record<string, string> = { ENTREE: "Entrée", SORTIE: "Sortie", TRANSFERT: "Transfert", RETOUR: "Retour" };
const TYPE_COLORS: Record<string, string> = { ENTREE: "#00a65a", SORTIE: "#dd4b39", TRANSFERT: "#3c8dbc", RETOUR: "#f39c12" };

export default async function MouvementsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const type = searchParams?.type ?? "";
  const search = searchParams?.search ?? "";

  const where: any = {};
  if (type) where.type = type;
  if (search) where.OR = [{ equipement: { nom: { contains: search, mode: "insensitive" } } }, { equipement: { reference: { contains: search, mode: "insensitive" } } }];

  const [items, total] = await Promise.all([
    prisma.mouvement.findMany({ where, include: { equipement: { select: { id: true, nom: true, reference: true } }, source: true, destination: true, createdPar: true }, orderBy: { dateOperation: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.mouvement.count({ where }),
  ]);
  const totalPages = Math.ceil(total / perPage);
  const canCreate = ["ADMIN", "MAGASINIER"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Mouvements <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Entrées, sorties et transferts</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Mouvements</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Historique des mouvements ({total})</h3>
            {canCreate && <Link href="/mouvements/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouveau mouvement</Link>}
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8 }}>
              <input name="search" className="form-control" style={{ width: 240 }} placeholder="Rechercher (équipement)..." defaultValue={search} />
              <select name="type" className="form-control" style={{ width: 180 }} defaultValue={type}>
                <option value="">Tous les types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="submit" className="btn btn-default">Filtrer</button>
              {(search || type) && <Link href="/mouvements" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Équipement</th>
                    <th style={{ padding: "10px 12px" }}>Type</th>
                    <th style={{ padding: "10px 12px" }}>Qté</th>
                    <th style={{ padding: "10px 12px" }}>Source</th>
                    <th style={{ padding: "10px 12px" }}>Destination</th>
                    <th style={{ padding: "10px 12px" }}>Motif</th>
                    <th style={{ padding: "10px 12px" }}>Date</th>
                    <th style={{ padding: "10px 12px" }}>Par</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucun mouvement trouvé.</td></tr>}
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 12px" }}>
                        <Link href={`/equipements/${item.equipement.id}`} style={{ color: "#3c8dbc", textDecoration: "none", fontWeight: 500 }}>{item.equipement.nom}</Link>
                        <div style={{ fontSize: 11, color: "#999", fontFamily: "monospace" }}>{item.equipement.reference}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: (TYPE_COLORS[item.type] ?? "#ccc") + "22", color: TYPE_COLORS[item.type] ?? "#333", fontWeight: 600 }}>
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>{item.quantite}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#777" }}>{item.source?.nom ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{item.destination?.nom ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#777" }}>{item.motif ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{new Date(item.dateOperation).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{item.createdPar.prenom} {item.createdPar.nom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/mouvements?type=${type}&search=${search}&page=${page - 1}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={`/mouvements?type=${type}&search=${search}&page=${p}`}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={`/mouvements?type=${type}&search=${search}&page=${page + 1}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

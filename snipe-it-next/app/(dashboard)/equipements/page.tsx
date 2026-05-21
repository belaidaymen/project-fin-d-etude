import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Package, Search } from "lucide-react";

const ETAT_COLORS: Record<string, string> = {
  BON: "#00a65a", MOYEN: "#f39c12", MAUVAIS: "#dd4b39",
  HORS_SERVICE: "#777", EN_MAINTENANCE: "#00c0ef", REFORME: "#605ca8",
};
const ETAT_LABELS: Record<string, string> = {
  BON: "Bon", MOYEN: "Moyen", MAUVAIS: "Mauvais",
  HORS_SERVICE: "Hors service", EN_MAINTENANCE: "En maintenance", REFORME: "Réformé",
};

export default async function EquipementsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";
  const etat = searchParams?.etat ?? "";
  const categorieId = searchParams?.categorieId ?? "";

  const where: any = {};
  if (search) where.OR = [{ nom: { contains: search, mode: "insensitive" } }, { reference: { contains: search, mode: "insensitive" } }, { marque: { contains: search, mode: "insensitive" } }];
  if (etat) where.etat = etat;
  if (categorieId) where.categorieId = Number(categorieId);

  const [items, total, categories] = await Promise.all([
    prisma.equipement.findMany({ where, include: { categorie: true, fournisseur: true, affectations: { where: { actif: true }, include: { localisation: true }, take: 1 } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.equipement.count({ where }),
    prisma.categorie.findMany({ orderBy: { nom: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const canEdit = ["ADMIN", "LOGISTICIEN", "MAGASINIER"].includes(role);

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams({ ...(search && { search }), ...(etat && { etat }), ...(categorieId && { categorieId }), page: "1", ...params });
    return `/equipements?${p.toString()}`;
  };

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>
          Équipements
          <small style={{ fontSize: 14, color: "#999", marginLeft: 8 }}>Inventaire du matériel</small>
        </h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li className="active">Équipements</li>
        </ol>
      </section>

      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Liste des équipements ({total})</h3>
            {canEdit && (
              <Link href="/equipements/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} /> Nouvel équipement
              </Link>
            )}
          </div>

          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 200px" }}>
                <input name="search" className="form-control" placeholder="Rechercher (nom, référence, marque)..." defaultValue={search} />
              </div>
              <div>
                <select name="etat" className="form-control" defaultValue={etat}>
                  <option value="">Tous les états</option>
                  {Object.entries(ETAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <select name="categorieId" className="form-control" defaultValue={categorieId}>
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-default">Filtrer</button>
              {(search || etat || categorieId) && <Link href="/equipements" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>

          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Référence</th>
                    <th style={{ padding: "10px 12px" }}>Nom</th>
                    <th style={{ padding: "10px 12px" }}>Catégorie</th>
                    <th style={{ padding: "10px 12px" }}>Marque / Modèle</th>
                    <th style={{ padding: "10px 12px" }}>État</th>
                    <th style={{ padding: "10px 12px" }}>Localisation</th>
                    <th style={{ padding: "10px 12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucun équipement trouvé.</td></tr>
                  )}
                  {items.map(item => {
                    const affectation = item.affectations[0];
                    return (
                      <tr key={item.id}>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 600, color: "#3c8dbc" }}>
                          <Link href={`/equipements/${item.id}`} style={{ color: "#3c8dbc", textDecoration: "none" }}>{item.reference}</Link>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: 500 }}>{item.nom}</div>
                          {item.numeroSerie && <div style={{ fontSize: 11, color: "#999" }}>N°: {item.numeroSerie}</div>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: 12, padding: "2px 8px", background: "#3c8dbc22", color: "#3c8dbc", borderRadius: 10 }}>{item.categorie.nom}</span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 13 }}>
                          {item.marque && <div>{item.marque}</div>}
                          {item.modele && <div style={{ color: "#999", fontSize: 12 }}>{item.modele}</div>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, background: (ETAT_COLORS[item.etat] ?? "#ccc") + "22", color: ETAT_COLORS[item.etat] ?? "#333", fontWeight: 600 }}>
                            {ETAT_LABELS[item.etat] ?? item.etat}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "#555" }}>
                          {affectation ? (
                            <Link href={`/localisations/${affectation.localisation.id}`} style={{ color: "#555", textDecoration: "none" }}>
                              {affectation.localisation.nom}
                            </Link>
                          ) : <span style={{ color: "#bbb" }}>Non affecté</span>}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Link href={`/equipements/${item.id}`} className="btn btn-default btn-xs">Voir</Link>
                            {canEdit && <Link href={`/equipements/${item.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#777" }}>Page {page} sur {totalPages} — {total} équipement(s)</span>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={buildUrl({ page: String(page - 1) })}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={buildUrl({ page: String(p) })}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={buildUrl({ page: String(page + 1) })}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

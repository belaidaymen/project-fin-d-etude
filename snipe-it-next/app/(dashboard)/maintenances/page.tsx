import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Wrench, Plus } from "lucide-react";

const statutColors: Record<string, string> = {
  PLANIFIEE: "#3c8dbc",
  EN_COURS: "#f39c12",
  TERMINEE: "#00a65a",
  ANNULEE: "#dd4b39",
};

const typeLabels: Record<string, string> = {
  PREVENTIVE: "Préventive",
  CORRECTIVE: "Corrective",
  MISE_A_JOUR: "Mise à jour",
  REMPLACEMENT: "Remplacement",
};

export default async function MaintenancesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = search ? {
    OR: [
      { description: { contains: search, mode: "insensitive" } },
      { equipement: { nom: { contains: search, mode: "insensitive" } } },
      { equipement: { reference: { contains: search, mode: "insensitive" } } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      include: { equipement: { select: { id: true, nom: true, reference: true } } },
      orderBy: { dateDebut: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.maintenance.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);
  const isAdmin = ["ADMIN", "LOGISTICIEN"].includes(session.user?.role ?? "");

  return (
    <>
      <section className="content-header">
        <h1>Maintenances <small>Journal des maintenances</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li className="active">Maintenances</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Liste des maintenances</h3>
            {isAdmin && (
              <div style={{ float: "right" }}>
                <Link href="/maintenances/create" className="btn btn-primary btn-sm">
                  <Plus size={14} style={{ marginRight: 4 }} />Nouvelle maintenance
                </Link>
              </div>
            )}
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10 }}>
              <form method="GET" style={{ display: "flex", gap: 6 }}>
                <input name="search" className="form-control" style={{ width: 240 }} placeholder="Rechercher..." defaultValue={search} />
                <button type="submit" className="btn btn-default btn-sm">Chercher</button>
              </form>
              <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total} maintenance{total !== 1 ? "s" : ""}</span>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Équipement</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th>Coût (DZD)</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucune maintenance trouvée.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Link href={`/equipements/${item.equipementId}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                          {item.equipement.reference}
                        </Link>
                        <div style={{ fontSize: 11, color: "#777" }}>{item.equipement.nom}</div>
                      </td>
                      <td><span className="label label-info">{typeLabels[item.type] ?? item.type}</span></td>
                      <td style={{ maxWidth: 220, fontSize: 13 }}>{item.description}</td>
                      <td style={{ fontSize: 12 }}>{new Date(item.dateDebut).toLocaleDateString("fr-FR")}</td>
                      <td style={{ fontSize: 12 }}>{item.dateFin ? new Date(item.dateFin).toLocaleDateString("fr-FR") : <span className="text-muted">En cours</span>}</td>
                      <td>{item.cout ? Number(item.cout).toLocaleString("fr-FR") : "—"}</td>
                      <td>
                        <span className="label" style={{ background: statutColors[item.statut] ?? "#777", color: "#fff" }}>
                          {item.statut.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <Link href={`/maintenances/${item.id}`} className="btn btn-xs btn-default">Détails</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/maintenances?page=${page - 1}${search ? `&search=${search}` : ""}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={`/maintenances?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={`/maintenances?page=${page + 1}${search ? `&search=${search}` : ""}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

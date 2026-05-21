import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = { SALLE: "Salle", LABORATOIRE: "Laboratoire", SERVICE: "Service", ENTREPOT: "Entrepôt" };
const ETAT_COLORS: Record<string, string> = { BON: "#00a65a", MOYEN: "#f39c12", MAUVAIS: "#dd4b39", HORS_SERVICE: "#777", EN_MAINTENANCE: "#00c0ef", REFORME: "#605ca8" };
const ETAT_LABELS: Record<string, string> = { BON: "Bon", MOYEN: "Moyen", MAUVAIS: "Mauvais", HORS_SERVICE: "Hors service", EN_MAINTENANCE: "En maintenance", REFORME: "Réformé" };

export default async function LocalisationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;

  const item = await prisma.localisation.findUnique({
    where: { id: Number(params.id) },
    include: { affectations: { where: { actif: true }, include: { equipement: { include: { categorie: true } } }, orderBy: { dateAffectation: "desc" } }, users: true },
  });
  if (!item) notFound();
  const canEdit = ["ADMIN", "LOGISTICIEN"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>{item.nom} <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>{TYPE_LABELS[item.type]}</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/localisations">Localisations</Link></li><li className="active">{item.nom}</li></ol>
      </section>
      <section className="content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
          <div className="box box-primary">
            <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 className="box-title">Informations</h3>
              {canEdit && <Link href={`/localisations/${item.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>}
            </div>
            <div className="box-body">
              <table className="table table-condensed" style={{ margin: 0 }}>
                <tbody>
                  {[["Nom", item.nom], ["Type", TYPE_LABELS[item.type]], ["Bâtiment", item.batiment ?? "—"], ["Étage", item.etage ?? "—"], ["Capacité", item.capacite ? `${item.capacite} personnes` : "—"], ["Statut", item.actif ? "Active" : "Inactive"], ["Description", item.description ?? "—"]].map(([l, v]) => (
                    <tr key={String(l)}><td style={{ fontWeight: 600, color: "#777", fontSize: 13, width: "40%", padding: "6px 0" }}>{l}</td><td style={{ fontSize: 13, padding: "6px 0" }}>{v}</td></tr>
                  ))}
                  <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13, padding: "6px 0" }}>Responsables</td><td style={{ fontSize: 13, padding: "6px 0" }}>{item.users.length > 0 ? item.users.map(u => `${u.prenom} ${u.nom}`).join(", ") : "—"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-default">
            <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="box-title">Équipements affectés ({item.affectations.length})</h3>
              {canEdit && <Link href={`/affectations/create?localisationId=${item.id}`} className="btn btn-success btn-xs">+ Affecter un équipement</Link>}
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Référence</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Équipement</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Catégorie</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>État</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Date affectation</th>
                  </tr>
                </thead>
                <tbody>
                  {item.affectations.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#999" }}>Aucun équipement affecté.</td></tr>}
                  {item.affectations.map(a => (
                    <tr key={a.id}>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 600 }}>
                        <Link href={`/equipements/${a.equipement.id}`} style={{ color: "#3c8dbc", textDecoration: "none" }}>{a.equipement.reference}</Link>
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 13 }}>{a.equipement.nom}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>
                        <span style={{ padding: "1px 6px", borderRadius: 10, background: "#3c8dbc22", color: "#3c8dbc" }}>{a.equipement.categorie.nom}</span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: (ETAT_COLORS[a.equipement.etat] ?? "#ccc") + "22", color: ETAT_COLORS[a.equipement.etat] ?? "#333", fontWeight: 600 }}>
                          {ETAT_LABELS[a.equipement.etat] ?? a.equipement.etat}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{new Date(a.dateAffectation).toLocaleDateString("fr-FR")}</td>
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

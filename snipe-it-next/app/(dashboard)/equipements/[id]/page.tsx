import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

const ETAT_COLORS: Record<string, string> = { BON: "#00a65a", MOYEN: "#f39c12", MAUVAIS: "#dd4b39", HORS_SERVICE: "#777", EN_MAINTENANCE: "#00c0ef", REFORME: "#605ca8" };
const ETAT_LABELS: Record<string, string> = { BON: "Bon", MOYEN: "Moyen", MAUVAIS: "Mauvais", HORS_SERVICE: "Hors service", EN_MAINTENANCE: "En maintenance", REFORME: "Réformé" };
const TYPE_MOUV: Record<string, string> = { ENTREE: "Entrée", SORTIE: "Sortie", TRANSFERT: "Transfert", RETOUR: "Retour" };

export default async function EquipementDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;

  const item = await prisma.equipement.findUnique({
    where: { id: Number(params.id) },
    include: { categorie: true, fournisseur: true, affectations: { include: { localisation: true, createdPar: true }, orderBy: { dateAffectation: "desc" } }, mouvements: { include: { source: true, destination: true, createdPar: true }, orderBy: { dateOperation: "desc" }, take: 10 }, maintenances: { orderBy: { dateDebut: "desc" } } },
  });
  if (!item) notFound();

  const canEdit = ["ADMIN", "LOGISTICIEN", "MAGASINIER"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>
          {item.reference}
          <small style={{ marginLeft: 8, color: "#999" }}>{item.nom}</small>
        </h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/equipements">Équipements</Link></li>
          <li className="active">{item.reference}</li>
        </ol>
      </section>

      <section className="content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="box box-primary">
            <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="box-title">Informations générales</h3>
              {canEdit && <Link href={`/equipements/${item.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>}
            </div>
            <div className="box-body">
              <table className="table table-condensed" style={{ margin: 0 }}>
                <tbody>
                  {[
                    ["Référence", <code key="r">{item.reference}</code>],
                    ["Nom", item.nom],
                    ["Catégorie", item.categorie.nom],
                    ["État", <span key="e" style={{ padding: "2px 8px", borderRadius: 10, background: (ETAT_COLORS[item.etat] ?? "#ccc") + "22", color: ETAT_COLORS[item.etat], fontWeight: 600, fontSize: 12 }}>{ETAT_LABELS[item.etat] ?? item.etat}</span>],
                    ["Marque", item.marque ?? "—"],
                    ["Modèle", item.modele ?? "—"],
                    ["N° de série", item.numeroSerie ?? "—"],
                    ["Quantité", item.quantite],
                    ["Fournisseur", item.fournisseur?.nom ?? "—"],
                    ["Date d'acquisition", item.dateAcquisition ? new Date(item.dateAcquisition).toLocaleDateString("fr-FR") : "—"],
                    ["Prix d'acquisition", item.prixAcquisition ? `${Number(item.prixAcquisition).toLocaleString("fr-FR")} DZD` : "—"],
                    ["Description", item.description ?? "—"],
                    ["Notes", item.notes ?? "—"],
                  ].map(([label, value]) => (
                    <tr key={String(label)}>
                      <td style={{ fontWeight: 600, color: "#777", width: "40%", padding: "6px 0", fontSize: 13 }}>{label}</td>
                      <td style={{ padding: "6px 0", fontSize: 13 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Affectations actives</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-condensed" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Localisation</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Date</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {item.affectations.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>Aucune affectation</td></tr>}
                  {item.affectations.map(a => (
                    <tr key={a.id}>
                      <td style={{ padding: "8px 12px", fontSize: 13 }}>
                        <Link href={`/localisations/${a.localisation.id}`} style={{ color: "#3c8dbc", textDecoration: "none" }}>{a.localisation.nom}</Link>
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{new Date(a.dateAffectation).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: a.actif ? "#00a65a22" : "#77777722", color: a.actif ? "#00a65a" : "#777", fontWeight: 600 }}>
                          {a.actif ? "Active" : "Terminée"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="box box-info">
            <div className="box-header with-border"><h3 className="box-title">Historique des mouvements</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-condensed" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Type</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Date</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {item.mouvements.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>Aucun mouvement</td></tr>}
                  {item.mouvements.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: "#00c0ef22", color: "#00c0ef", fontWeight: 600 }}>{TYPE_MOUV[m.type] ?? m.type}</span>
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{new Date(m.dateOperation).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{m.destination?.nom ?? m.source?.nom ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-warning">
            <div className="box-header with-border"><h3 className="box-title">Maintenances</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-condensed" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Description</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Date</th>
                    <th style={{ padding: "8px 12px", fontSize: 12 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {item.maintenances.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>Aucune maintenance</td></tr>}
                  {item.maintenances.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: "8px 12px", fontSize: 13 }}>{m.description}</td>
                      <td style={{ padding: "8px 12px", fontSize: 12 }}>{new Date(m.dateDebut).toLocaleDateString("fr-FR")}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: m.statut === "EN_COURS" ? "#f39c1222" : "#00a65a22", color: m.statut === "EN_COURS" ? "#f39c12" : "#00a65a", fontWeight: 600 }}>{m.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {canEdit && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Link href={`/affectations/create?equipementId=${item.id}`} className="btn btn-success btn-sm">+ Nouvelle affectation</Link>
            <Link href={`/mouvements/create?equipementId=${item.id}`} className="btn btn-info btn-sm">+ Nouveau mouvement</Link>
            <Link href={`/maintenances/create?equipementId=${item.id}`} className="btn btn-warning btn-sm">+ Nouvelle maintenance</Link>
          </div>
        )}
      </section>
    </>
  );
}

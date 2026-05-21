import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import DemandeActions from "./DemandeActions";

const STATUT_COLORS: Record<string, string> = { EN_ATTENTE: "#f39c12", EN_COURS: "#00c0ef", APPROUVEE: "#00a65a", REJETEE: "#dd4b39", CLOTUREE: "#605ca8" };
const PRIORITE_COLORS: Record<string, string> = { BASSE: "#aaa", NORMALE: "#3c8dbc", HAUTE: "#f39c12", URGENTE: "#dd4b39" };
const TYPE_LABELS: Record<string, string> = { ACHAT: "Demande d'achat", REMPLACEMENT: "Demande de remplacement", REFORME: "Demande de réforme", MAINTENANCE: "Demande de maintenance" };

export default async function DemandeDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;

  const item = await prisma.demande.findUnique({
    where: { id: Number(params.id) },
    include: { createdPar: true, equipement: true, validatePar: true },
  });
  if (!item) notFound();

  const canValidate = ["ADMIN", "LOGISTICIEN"].includes(role) && item.statut === "EN_ATTENTE";

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>
          {item.titre}
          <span style={{ marginLeft: 10, fontSize: 13, padding: "3px 10px", borderRadius: 10, background: (STATUT_COLORS[item.statut] ?? "#ccc") + "22", color: STATUT_COLORS[item.statut] ?? "#333", fontWeight: 600 }}>
            {item.statut.replace(/_/g, " ")}
          </span>
        </h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/demandes">Demandes</Link></li><li className="active">#{item.id}</li></ol>
      </section>
      <section className="content">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div>
            <div className="box box-primary">
              <div className="box-header with-border"><h3 className="box-title">Détails de la demande</h3></div>
              <div className="box-body">
                <table className="table table-condensed" style={{ margin: 0 }}>
                  <tbody>
                    {[
                      ["Type", TYPE_LABELS[item.type] ?? item.type],
                      ["Priorité", <span key="p" style={{ padding: "2px 8px", borderRadius: 10, background: (PRIORITE_COLORS[item.priorite] ?? "#ccc") + "22", color: PRIORITE_COLORS[item.priorite] ?? "#333", fontWeight: 600, fontSize: 12 }}>{item.priorite}</span>],
                      ["Statut", <span key="s" style={{ padding: "2px 8px", borderRadius: 10, background: (STATUT_COLORS[item.statut] ?? "#ccc") + "22", color: STATUT_COLORS[item.statut] ?? "#333", fontWeight: 600, fontSize: 12 }}>{item.statut.replace(/_/g, " ")}</span>],
                      ["Demandeur", `${item.createdPar.prenom} ${item.createdPar.nom}`],
                      ["Date de soumission", new Date(item.createdAt).toLocaleDateString("fr-FR")],
                      ["Équipement concerné", item.equipement ? `${item.equipement.reference} — ${item.equipement.nom}` : "—"],
                      ["Quantité demandée", item.quantite ?? "—"],
                    ].map(([l, v]) => (
                      <tr key={String(l)}><td style={{ fontWeight: 600, color: "#777", fontSize: 13, width: "35%", padding: "8px 0" }}>{l}</td><td style={{ fontSize: 13, padding: "8px 0" }}>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Description</h3></div>
              <div className="box-body"><p style={{ lineHeight: 1.7, color: "#444" }}>{item.description}</p></div>
            </div>

            {item.justification && (
              <div className="box box-info">
                <div className="box-header with-border"><h3 className="box-title">Justification</h3></div>
                <div className="box-body"><p style={{ lineHeight: 1.7, color: "#444" }}>{item.justification}</p></div>
              </div>
            )}
          </div>

          <div>
            {item.statut !== "EN_ATTENTE" && item.validatePar && (
              <div className="box box-success">
                <div className="box-header with-border"><h3 className="box-title">Décision</h3></div>
                <div className="box-body">
                  <table className="table table-condensed" style={{ margin: 0 }}>
                    <tbody>
                      <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13 }}>Validé par</td><td style={{ fontSize: 13 }}>{item.validatePar.prenom} {item.validatePar.nom}</td></tr>
                      <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13 }}>Date</td><td style={{ fontSize: 13 }}>{item.dateValidation ? new Date(item.dateValidation).toLocaleDateString("fr-FR") : "—"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {canValidate && <DemandeActions demandeId={item.id} />}

            {item.notes && (
              <div className="box box-warning">
                <div className="box-header with-border"><h3 className="box-title">Notes</h3></div>
                <div className="box-body"><p style={{ fontSize: 13, color: "#555", margin: 0 }}>{item.notes}</p></div>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
              <Link href="/demandes" className="btn btn-default btn-block">← Retour aux demandes</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

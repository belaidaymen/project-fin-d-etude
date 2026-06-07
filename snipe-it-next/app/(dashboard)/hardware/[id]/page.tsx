import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import DeleteAssetButton from "./DeleteAssetButton";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const asset = await prisma.asset.findFirst({
    where: { id: id, deletedAt: null },
    include: {
      category: true,
      status: true,
      location: true,
      actionlogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!asset) notFound();

  return (
    <>
      <section className="content-header">
        <h1>
          {asset.name ?? asset.assetTag}
          <small>&nbsp;Détail de l'équipement</small>
        </h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/hardware">Équipements</Link></li>
          <li className="active">{asset.assetTag}</li>
        </ol>
      </section>

      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/hardware" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Retour</Link>
          <Link href={`/hardware/${asset.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Modifier</Link>
          <DeleteAssetButton id={asset.id} assetTag={asset.assetTag} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Asset Info */}
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">Informations générales</h3>
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Étiquette</td><td><strong>{asset.assetTag}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Nom / Désignation</td><td>{asset.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Référence</td><td style={{ fontFamily: "monospace" }}>{asset.reference ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Numéro de série</td><td style={{ fontFamily: "monospace" }}>{asset.serial ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Catégorie</td><td>{asset.category?.name ?? "—"}</td></tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: "#777" }}>Statut</td>
                    <td>
                      {asset.status ? (
                        <span className="status-badge" style={{ background: asset.status.color ?? "#777" }}>
                          {asset.status.name}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Emplacement</td><td>{asset.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Quantité</td><td>{asset.quantity}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase info */}
          <div>
            <div className="box box-success">
              <div className="box-header with-border">
                <h3 className="box-title">Informations d'achat</h3>
              </div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr><td style={{ width: "50%", fontWeight: 600, color: "#777" }}>Date d'achat</td><td>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString("fr-FR") : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Coût d'achat</td><td>{asset.purchaseCost ? `${Number(asset.purchaseCost).toLocaleString("fr-FR")} DZD` : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Ajouté le</td><td>{new Date(asset.createdAt).toLocaleDateString("fr-FR")}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Modifié le</td><td>{new Date(asset.updatedAt).toLocaleDateString("fr-FR")}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {asset.notes && (
              <div className="box box-default">
                <div className="box-header with-border"><h3 className="box-title">Notes</h3></div>
                <div className="box-body"><p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{asset.notes}</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">Historique des actions</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            {asset.actionlogs.length === 0 ? (
              <div style={{ padding: 15, color: "#999", textAlign: "center" }}>Aucune action enregistrée.</div>
            ) : (
              <table className="table table-hover">
                <thead><tr><th>Action</th><th>Note</th><th>Date</th></tr></thead>
                <tbody>
                  {asset.actionlogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span className={`label ${log.actionType === "checkout" ? "label-success" : log.actionType === "checkin" ? "label-info" : "label-default"}`}>
                          {log.actionType}
                        </span>
                      </td>
                      <td style={{ color: "#777", fontSize: 12 }}>{log.note ?? "—"}</td>
                      <td style={{ color: "#777", fontSize: 12 }}>{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

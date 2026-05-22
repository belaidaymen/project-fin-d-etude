import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Pencil, ArrowLeft, Package } from "lucide-react";

export default async function CategorieDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const cat = await prisma.categorie.findUnique({
    where: { id },
    include: {
      equipements: { take: 25, orderBy: { nom: "asc" }, select: { id: true, reference: true, nom: true, etat: true } },
      _count: { select: { equipements: true } },
    },
  });
  if (!cat) notFound();

  const etatColors: Record<string, string> = { BON: "#00a65a", MOYEN: "#f39c12", MAUVAIS: "#dd4b39", EN_MAINTENANCE: "#3c8dbc", HORS_SERVICE: "#777" };

  return (
    <>
      <section className="content-header">
        <h1>{cat.nom}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/categories">Catégories</Link></li>
          <li className="active">{cat.nom}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 300px" }}>
            <div className="box box-primary">
              <div className="box-header with-border">
                <h3 className="box-title">Détails de la catégorie</h3>
              </div>
              <div className="box-body">
                <table className="table table-condensed">
                  <tbody>
                    <tr><th style={{ width: 130 }}>Nom</th><td>{cat.nom}</td></tr>
                    <tr><th>Description</th><td>{cat.description ?? "—"}</td></tr>
                    <tr><th>Équipements</th><td><span className="badge" style={{ background: "#00a65a" }}>{cat._count.equipements}</span></td></tr>
                    <tr><th>Créée le</th><td style={{ fontSize: 12 }}>{new Date(cat.createdAt).toLocaleDateString("fr-FR")}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="box-footer">
                <Link href={`/categories/${cat.id}/edit`} className="btn btn-primary btn-sm" style={{ marginRight: 8 }}>
                  <Pencil size={13} style={{ marginRight: 4 }} />Modifier
                </Link>
                <Link href="/categories" className="btn btn-default btn-sm">
                  <ArrowLeft size={13} style={{ marginRight: 4 }} />Retour
                </Link>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <div className="box box-default">
              <div className="box-header with-border">
                <h3 className="box-title"><Package size={16} style={{ marginRight: 6 }} />Équipements ({cat._count.equipements})</h3>
              </div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-striped table-hover" style={{ marginBottom: 0 }}>
                  <thead><tr><th>Référence</th><th>Nom</th><th>État</th></tr></thead>
                  <tbody>
                    {cat.equipements.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999" }}>Aucun équipement dans cette catégorie.</td></tr>
                    ) : cat.equipements.map(eq => (
                      <tr key={eq.id}>
                        <td><Link href={`/equipements/${eq.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>{eq.reference}</Link></td>
                        <td>{eq.nom}</td>
                        <td><span className="label" style={{ background: etatColors[eq.etat] ?? "#777", color: "#fff" }}>{eq.etat.replace("_", " ")}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

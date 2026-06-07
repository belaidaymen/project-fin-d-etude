import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function StatusLabelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const label = await prisma.statuslabel.findFirst({
    where: { id: id, deletedAt: null },
    include: { assets: { where: { deletedAt: null }, take: 20 } },
  });
  if (!label) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{label.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/statuslabels">États</Link></li>
          <li className="active">{label.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/statuslabels" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Retour</Link>
          <Link href={`/statuslabels/${label.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Modifier</Link>
        </div>
        <div className="box box-primary">
          <div className="box-header with-border">
            <h3 className="box-title">Détails de l'état</h3>
            {label.color && (
              <span style={{ float: "right", background: label.color, color: "#fff", padding: "2px 12px", borderRadius: 3, fontSize: 13 }}>
                {label.name}
              </span>
            )}
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table">
              <tbody>
                <tr><td style={{ width: "35%", fontWeight: 600, color: "#777" }}>Nom</td><td><strong>{label.name}</strong></td></tr>
                <tr>
                  <td style={{ fontWeight: 600, color: "#777" }}>Couleur</td>
                  <td>
                    {label.color
                      ? <><span style={{ display: "inline-block", width: 18, height: 18, background: label.color, borderRadius: 3, marginRight: 6, verticalAlign: "middle" }} />{label.color}</>
                      : "—"}
                  </td>
                </tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Équipements</td><td>{label.assets.length}</td></tr>
                {label.notes && <tr><td style={{ fontWeight: 600, color: "#777" }}>Notes</td><td>{label.notes}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

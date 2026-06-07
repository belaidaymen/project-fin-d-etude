import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const cat = await prisma.category.findFirst({
    where: { id: id, deletedAt: null },
    include: {
      assets: { where: { deletedAt: null }, take: 25, include: { status: true } },
    },
  });
  if (!cat) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{cat.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/categories">Catégories</Link></li>
          <li className="active">{cat.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/categories" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Retour</Link>
          <Link href={`/categories/${cat.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Modifier</Link>
        </div>
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Détails de la catégorie</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table">
              <tbody>
                <tr><td style={{ width: "35%", fontWeight: 600, color: "#777" }}>Nom</td><td><strong>{cat.name}</strong></td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Équipements</td><td>{cat.assets.length}</td></tr>
                {cat.notes && <tr><td style={{ fontWeight: 600, color: "#777" }}>Notes</td><td>{cat.notes}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {cat.assets.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Équipements dans cette catégorie</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Étiquette</th><th>Nom</th><th>État</th></tr></thead>
                <tbody>
                  {cat.assets.map(a => (
                    <tr key={a.id}>
                      <td><Link href={`/hardware/${a.id}`} style={{ color: "#337ab7" }}>{a.assetTag}</Link></td>
                      <td>{a.name}</td>
                      <td>{a.status ? <span style={{ background: a.status.color || "#888", color: "#fff", padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>{a.status.name}</span> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

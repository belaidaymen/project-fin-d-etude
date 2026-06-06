import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function LocationDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const location = await prisma.location.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      parent: true,
      children: { where: { deletedAt: null } },
      assets: {
        where: { deletedAt: null },
        take: 25,
        include: { category: true, status: true },
      },
    },
  });
  if (!location) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{location.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/locations">Emplacements</Link></li>
          <li className="active">{location.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/locations" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Retour</Link>
          <Link href={`/locations/${location.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Modifier</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Détails de l'emplacement</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Nom</td><td><strong>{location.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Adresse</td><td>{[location.address, location.city, location.state, location.zip, location.country].filter(Boolean).join(", ") || "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Téléphone</td><td>{location.phone || "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Parent</td><td>{location.parent ? <Link href={`/locations/${location.parent.id}`} style={{ color: "#337ab7" }}>{location.parent.name}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Équipements</td><td>{location.assets.length}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {location.children.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Sous-emplacements</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table">
                  <tbody>
                    {location.children.map(c => (
                      <tr key={c.id}><td><Link href={`/locations/${c.id}`} style={{ color: "#337ab7" }}>{c.name}</Link></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {location.assets.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Équipements à cet emplacement</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Étiquette</th><th>Nom</th><th>Catégorie</th><th>État</th></tr></thead>
                <tbody>
                  {location.assets.map(a => (
                    <tr key={a.id}>
                      <td><Link href={`/hardware/${a.id}`} style={{ color: "#337ab7" }}>{a.assetTag}</Link></td>
                      <td>{a.name || "—"}</td>
                      <td>{a.category?.name || "—"}</td>
                      <td>{a.status && <span style={{ background: a.status.color || "#777", color: "#fff", padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>{a.status.name}</span>}</td>
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

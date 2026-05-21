import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function ManufacturerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const mfr = await prisma.manufacturer.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      models: { where: { deletedAt: null }, orderBy: { name: "asc" } },
    },
  });
  if (!mfr) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{mfr.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/manufacturers">Manufacturers</Link></li>
          <li className="active">{mfr.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/manufacturers" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/manufacturers/${mfr.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Manufacturer Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{mfr.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Website</td><td>{mfr.url ? <a href={mfr.url} target="_blank" rel="noreferrer" style={{ color: "#337ab7" }}>{mfr.url}</a> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Support URL</td><td>{mfr.supportUrl ? <a href={mfr.supportUrl} target="_blank" rel="noreferrer" style={{ color: "#337ab7" }}>{mfr.supportUrl}</a> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Support Phone</td><td>{mfr.supportPhone ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Support Email</td><td>{mfr.supportEmail ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Models</td><td>{mfr.models.length}</td></tr>
                  {mfr.notes && <tr><td style={{ fontWeight: 600, color: "#777" }}>Notes</td><td>{mfr.notes}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          {mfr.models.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Models ({mfr.models.length})</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>Name</th><th>Model #</th></tr></thead>
                  <tbody>
                    {mfr.models.map(m => (
                      <tr key={m.id}>
                        <td><Link href={`/models/${m.id}`} style={{ color: "#337ab7" }}>{m.name}</Link></td>
                        <td style={{ fontSize: 12, color: "#777" }}>{m.modelNumber ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

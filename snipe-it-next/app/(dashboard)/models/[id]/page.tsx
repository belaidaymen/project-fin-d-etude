import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function ModelDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const model = await prisma.assetModel.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      manufacturer: true,
      category: true,
      depreciation: true,
      assets: { where: { deletedAt: null }, take: 25, include: { status: true, assignedTo: true } },
    },
  });
  if (!model) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{model.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/models">Models</Link></li>
          <li className="active">{model.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/models" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/models/${model.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Model Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{model.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Model #</td><td style={{ fontFamily: "monospace" }}>{model.modelNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{model.manufacturer ? <Link href={`/manufacturers/${model.manufacturer.id}`} style={{ color: "#337ab7" }}>{model.manufacturer.name}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{model.category ? <Link href={`/categories/${model.category.id}`} style={{ color: "#337ab7" }}>{model.category.name}</Link> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Depreciation</td><td>{model.depreciation ? `${model.depreciation.name} (${model.depreciation.months} months)` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>End of Life</td><td>{model.eol ? `${model.eol} months` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Assets</td><td>{model.assets.length}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Requestable</td><td>{model.requestable ? "Yes" : "No"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {model.assets.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Assets ({model.assets.length})</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>Tag</th><th>Status</th><th>Assigned To</th></tr></thead>
                  <tbody>
                    {model.assets.map(a => (
                      <tr key={a.id}>
                        <td><Link href={`/hardware/${a.id}`} style={{ color: "#337ab7" }}>{a.assetTag}</Link></td>
                        <td>{a.status && <span style={{ background: a.status.color || "#777", color: "#fff", padding: "2px 6px", borderRadius: 3, fontSize: 11 }}>{a.status.name}</span>}</td>
                        <td style={{ fontSize: 12 }}>{a.assignedTo ? <Link href={`/users/${a.assignedTo.id}`} style={{ color: "#337ab7" }}>{a.assignedTo.firstName} {a.assignedTo.lastName}</Link> : <span style={{ color: "#999" }}>Available</span>}</td>
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

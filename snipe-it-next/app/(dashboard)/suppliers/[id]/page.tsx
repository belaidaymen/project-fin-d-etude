import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const supplier = await prisma.supplier.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      assets: { where: { deletedAt: null }, take: 20, include: { model: true, status: true } },
    },
  });
  if (!supplier) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{supplier.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/suppliers">Suppliers</Link></li>
          <li className="active">{supplier.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/suppliers" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/suppliers/${supplier.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Supplier Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{supplier.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Contact</td><td>{supplier.contact ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Email</td><td>{supplier.email ? <a href={`mailto:${supplier.email}`} style={{ color: "#337ab7" }}>{supplier.email}</a> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Phone</td><td>{supplier.phone ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Website</td><td>{supplier.url ? <a href={supplier.url} target="_blank" rel="noreferrer" style={{ color: "#337ab7" }}>{supplier.url}</a> : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Address</td><td>{[supplier.address, supplier.city, supplier.state, supplier.zip, supplier.country].filter(Boolean).join(", ") || "—"}</td></tr>
                  {supplier.notes && <tr><td style={{ fontWeight: 600, color: "#777" }}>Notes</td><td>{supplier.notes}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          {supplier.assets.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Assets from this Supplier ({supplier.assets.length})</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>Tag</th><th>Model</th><th>Status</th></tr></thead>
                  <tbody>
                    {supplier.assets.map(a => (
                      <tr key={a.id}>
                        <td><Link href={`/hardware/${a.id}`} style={{ color: "#337ab7" }}>{a.assetTag}</Link></td>
                        <td style={{ fontSize: 12 }}>{a.model?.name ?? "—"}</td>
                        <td>{a.status && <span style={{ background: a.status.color || "#777", color: "#fff", padding: "2px 6px", borderRadius: 3, fontSize: 11 }}>{a.status.name}</span>}</td>
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

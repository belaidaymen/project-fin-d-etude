import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function ComponentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const comp = await prisma.component.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      manufacturer: true,
      category: true,
      supplier: true,
      location: true,
      company: true,
      assets: { include: { asset: { include: { model: true, status: true } } }, take: 20 },
    },
  });
  if (!comp) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{comp.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/components">Components</Link></li>
          <li className="active">{comp.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/components" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/components/${comp.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Component Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{comp.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Serial</td><td style={{ fontFamily: "monospace", fontSize: 13 }}>{comp.serial ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{comp.manufacturer?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{comp.category?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{comp.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Order #</td><td>{comp.orderNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Cost</td><td>{comp.purchaseCost ? `$${Number(comp.purchaseCost).toFixed(2)}` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Qty</td><td><strong>{comp.qty}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Min Qty</td><td>{comp.minAmt ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Installed</td><td>{comp.assets.length}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Available</td><td><span className={comp.qty - comp.assets.length > 0 ? "label label-success" : "label label-danger"}>{comp.qty - comp.assets.length}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {comp.assets.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Installed In</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>Asset</th><th>Model</th><th>Qty</th></tr></thead>
                  <tbody>
                    {comp.assets.map(ca => (
                      <tr key={ca.id}>
                        <td><Link href={`/hardware/${ca.asset.id}`} style={{ color: "#337ab7" }}>{ca.asset.assetTag}</Link></td>
                        <td style={{ fontSize: 12 }}>{ca.asset.model?.name ?? "—"}</td>
                        <td>{ca.qty}</td>
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

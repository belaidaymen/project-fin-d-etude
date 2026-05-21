import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function ConsumableDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const item = await prisma.consumable.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      manufacturer: true,
      category: true,
      supplier: true,
      location: true,
      company: true,
      checkouts: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!item) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{item.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/consumables">Consumables</Link></li>
          <li className="active">{item.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/consumables" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/consumables/${item.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Consumable Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{item.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{item.manufacturer?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{item.category?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{item.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Item #</td><td>{item.itemNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Order #</td><td>{item.orderNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Cost</td><td>{item.purchaseCost ? `$${Number(item.purchaseCost).toFixed(2)}` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Qty</td><td><strong>{item.qty}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Min Qty</td><td>{item.minAmt ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Requestable</td><td>{item.requestable ? "Yes" : "No"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {item.checkouts.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Recent Checkouts</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>User</th><th>Qty</th><th>Date</th></tr></thead>
                  <tbody>
                    {item.checkouts.map(co => (
                      <tr key={co.id}>
                        <td>{co.user ? <Link href={`/users/${co.user.id}`} style={{ color: "#337ab7" }}>{co.user.firstName} {co.user.lastName}</Link> : "—"}</td>
                        <td>{co.qty ?? 1}</td>
                        <td style={{ fontSize: 12 }}>{new Date(co.createdAt).toLocaleDateString()}</td>
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

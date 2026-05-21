import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function AccessoryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const acc = await prisma.accessory.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      manufacturer: true,
      category: true,
      supplier: true,
      location: true,
      company: true,
      checkouts: {
        where: { checkedIn: null },
        include: { user: true },
      },
    },
  });
  if (!acc) notFound();

  const available = acc.qty - acc.checkouts.length;

  return (
    <>
      <section className="content-header">
        <h1>{acc.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/accessories">Accessories</Link></li>
          <li className="active">{acc.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/accessories" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/accessories/${acc.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Accessory Details</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table">
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{acc.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{acc.manufacturer?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{acc.category?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{acc.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Model #</td><td>{acc.modelNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Order #</td><td>{acc.orderNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Cost</td><td>{acc.purchaseCost ? `$${Number(acc.purchaseCost).toFixed(2)}` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Date</td><td style={{ fontSize: 12 }}>{acc.purchaseDate ? new Date(acc.purchaseDate).toLocaleDateString() : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Qty Total</td><td><strong>{acc.qty}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Checked Out</td><td>{acc.checkouts.length}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Available</td><td><span className={acc.qty - acc.checkouts.length > 0 ? "label label-success" : "label label-danger"}>{acc.qty - acc.checkouts.length}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {acc.checkouts.length > 0 && (
            <div className="box box-default">
              <div className="box-header with-border"><h3 className="box-title">Checked Out To</h3></div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table table-hover">
                  <thead><tr><th>User</th><th>Date</th></tr></thead>
                  <tbody>
                    {acc.checkouts.map(co => (
                      <tr key={co.id}>
                        <td>{co.user ? <Link href={`/users/${co.user.id}`} style={{ color: "#337ab7" }}>{co.user.firstName} {co.user.lastName}</Link> : "—"}</td>
                        <td style={{ fontSize: 12 }}>{co.checkedOut ? new Date(co.checkedOut).toLocaleDateString() : "—"}</td>
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

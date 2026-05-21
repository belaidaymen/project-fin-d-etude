import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import DeleteLicenseButton from "./DeleteLicenseButton";

export default async function LicenseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const license = await prisma.license.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      manufacturer: true,
      supplier: true,
      category: true,
      company: true,
      licenseSeats: { include: { user: true }, orderBy: { seatNum: "asc" } },
    },
  });

  if (!license) notFound();

  const usedSeats = license.licenseSeats.filter(s => s.assigned).length;
  const availableSeats = license.seats - usedSeats;

  return (
    <>
      <section className="content-header">
        <h1>{license.name} <small>License Details</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/licenses">Licenses</Link></li>
          <li className="active">{license.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/licenses" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/licenses/${license.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
          <DeleteLicenseButton id={license.id} name={license.name} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">License Information</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{license.name}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Serial</td><td style={{ fontFamily: "monospace" }}>{license.serial ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Total Seats</td><td>{license.seats}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Used</td><td><span className="label label-warning">{usedSeats}</span></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Available</td><td><span className={`label ${availableSeats > 0 ? "label-success" : "label-danger"}`}>{availableSeats}</span></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{license.manufacturer?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Supplier</td><td>{license.supplier?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{license.category?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Company</td><td>{license.company?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Maintained</td><td>{license.maintained ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Reassignable</td><td>{license.reassignable ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="box box-success">
            <div className="box-header with-border"><h3 className="box-title">Purchase Info</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "45%", fontWeight: 600, color: "#777" }}>Licensed To</td><td>{license.licenseName ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>License Email</td><td>{license.licenseEmail ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Order Number</td><td>{license.orderNumber ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Order</td><td>{license.purchaseOrder ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Date</td><td>{license.purchaseDate ? new Date(license.purchaseDate).toLocaleDateString() : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Cost</td><td>{license.purchaseCost ? `$${Number(license.purchaseCost).toFixed(2)}` : "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Expiration</td><td>
                    {license.expirationDate ? (
                      <span style={{ color: new Date(license.expirationDate) < new Date() ? "#d9534f" : undefined }}>
                        {new Date(license.expirationDate).toLocaleDateString()}
                        {new Date(license.expirationDate) < new Date() && " (Expired)"}
                      </span>
                    ) : "—"}
                  </td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">License Seats ({license.seats})</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table table-hover">
              <thead><tr><th>Seat #</th><th>Assigned To</th><th>Status</th></tr></thead>
              <tbody>
                {license.licenseSeats.map(seat => (
                  <tr key={seat.id}>
                    <td>{seat.seatNum ?? "—"}</td>
                    <td>{seat.user ? <Link href={`/users/${seat.user.id}`} style={{ color: "#337ab7" }}>{seat.user.firstName} {seat.user.lastName}</Link> : <span style={{ color: "#999" }}>Available</span>}</td>
                    <td>{seat.assigned ? <span className="label label-warning">Assigned</span> : <span className="label label-success">Available</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

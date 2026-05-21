import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, LogIn, LogOut, Wrench, Trash2, ArrowLeft } from "lucide-react";
import DeleteAssetButton from "./DeleteAssetButton";

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const asset = await prisma.asset.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      model: { include: { manufacturer: true, category: true, depreciation: true } },
      status: true,
      company: true,
      location: true,
      rtdLocation: true,
      supplier: true,
      assignedTo: true,
      maintenances: { include: { supplier: true }, orderBy: { startDate: "desc" } },
      actionlogs: { include: { admin: true, user: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!asset) notFound();

  const STATUS_COLORS: Record<string, string> = {
    deployable: "#337ab7", pending: "#f0ad4e", archived: "#777", undeployable: "#d9534f",
  };

  return (
    <>
      <section className="content-header">
        <h1>
          {asset.name ?? asset.assetTag}
          <small>&nbsp;Asset Details</small>
        </h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/hardware">Assets</Link></li>
          <li className="active">{asset.assetTag}</li>
        </ol>
      </section>

      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/hardware" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/hardware/${asset.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
          {asset.assignedToId ? (
            <Link href={`/hardware/${asset.id}/checkin`} className="btn btn-primary btn-sm"><LogIn size={14} /> Check In</Link>
          ) : (
            <Link href={`/hardware/${asset.id}/checkout`} className="btn btn-success btn-sm"><LogOut size={14} /> Check Out</Link>
          )}
          <Link href={`/hardware/${asset.id}/maintenance/create`} className="btn btn-default btn-sm"><Wrench size={14} /> Log Maintenance</Link>
          <DeleteAssetButton id={asset.id} assetTag={asset.assetTag} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Asset Info */}
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">Asset Information</h3>
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table" style={{ marginBottom: 0 }}>
                <tbody>
                  <tr><td style={{ width: "35%", fontWeight: 600, color: "#777" }}>Asset Tag</td><td><strong>{asset.assetTag}</strong></td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Name</td><td>{asset.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Serial</td><td style={{ fontFamily: "monospace" }}>{asset.serial ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Model</td><td>{asset.model?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Manufacturer</td><td>{asset.model?.manufacturer?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Category</td><td>{asset.model?.category?.name ?? "—"}</td></tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: "#777" }}>Status</td>
                    <td>
                      {asset.status ? (
                        <span className="status-badge" style={{ background: asset.status.color || STATUS_COLORS[asset.status.statusType] || "#777" }}>
                          {asset.status.name}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Company</td><td>{asset.company?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Location</td><td>{asset.location?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Default Location</td><td>{asset.rtdLocation?.name ?? "—"}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Supplier</td><td>{asset.supplier?.name ?? "—"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Purchase & Assignment */}
          <div>
            <div className="box box-success">
              <div className="box-header with-border">
                <h3 className="box-title">Purchase & Warranty</h3>
              </div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr><td style={{ width: "45%", fontWeight: 600, color: "#777" }}>Purchase Date</td><td>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Purchase Cost</td><td>{asset.purchaseCost ? `$${Number(asset.purchaseCost).toFixed(2)}` : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Order Number</td><td>{asset.orderNumber ?? "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Warranty</td><td>{asset.warrantyMonths ? `${asset.warrantyMonths} months` : "—"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="box box-info">
              <div className="box-header with-border">
                <h3 className="box-title">Assigned To</h3>
              </div>
              <div className="box-body" style={{ padding: 0 }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: "45%", fontWeight: 600, color: "#777" }}>Checked Out To</td>
                      <td>
                        {asset.assignedTo ? (
                          <Link href={`/users/${asset.assignedTo.id}`} style={{ color: "#337ab7" }}>
                            {asset.assignedTo.firstName} {asset.assignedTo.lastName}
                          </Link>
                        ) : <span className="text-muted">Not checked out</span>}
                      </td>
                    </tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Last Checkout</td><td>{asset.lastCheckout ? new Date(asset.lastCheckout).toLocaleDateString() : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Last Checkin</td><td>{asset.lastCheckin ? new Date(asset.lastCheckin).toLocaleDateString() : "—"}</td></tr>
                    <tr><td style={{ fontWeight: 600, color: "#777" }}>Expected Checkin</td><td>{asset.expectedCheckin ? new Date(asset.expectedCheckin).toLocaleDateString() : "—"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {asset.notes && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Notes</h3></div>
            <div className="box-body"><p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{asset.notes}</p></div>
          </div>
        )}

        {/* Maintenances */}
        {asset.maintenances.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Maintenance History</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-striped">
                <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Cost</th><th>Supplier</th><th>Warranty</th></tr></thead>
                <tbody>
                  {asset.maintenances.map(m => (
                    <tr key={m.id}>
                      <td>{new Date(m.startDate).toLocaleDateString()}</td>
                      <td>{m.maintenanceType}</td>
                      <td>{m.title}</td>
                      <td>{m.cost ? `$${Number(m.cost).toFixed(2)}` : "—"}</td>
                      <td>{m.supplier?.name ?? "—"}</td>
                      <td>{m.isWarranty ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">Activity Log</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            {asset.actionlogs.length === 0 ? (
              <div style={{ padding: 15, color: "#999", textAlign: "center" }}>No activity recorded.</div>
            ) : (
              <table className="table table-hover">
                <thead><tr><th>Action</th><th>User</th><th>By</th><th>Note</th><th>Date</th></tr></thead>
                <tbody>
                  {asset.actionlogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span className={`label ${log.actionType === "checkout" ? "label-success" : log.actionType === "checkin" ? "label-info" : "label-default"}`}>
                          {log.actionType}
                        </span>
                      </td>
                      <td>{log.user ? `${log.user.firstName} ${log.user.lastName}` : "—"}</td>
                      <td>{log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : "—"}</td>
                      <td style={{ color: "#777", fontSize: 12 }}>{log.note ?? "—"}</td>
                      <td style={{ color: "#777", fontSize: 12 }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

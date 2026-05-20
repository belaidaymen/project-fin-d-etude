import { getAsset } from "@/lib/actions/assets";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { CheckoutForm } from "@/components/assets/checkout-form";
import { CheckinButton } from "@/components/assets/checkin-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteAsset } from "@/lib/actions/assets";
import { Package, MapPin, User, Calendar, DollarSign, Info, Clock, Wrench } from "lucide-react";

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = await getAsset(parseInt(params.id));
  if (!asset) notFound();

  const isAssigned = !!asset.assignedToId;

  return (
    <div>
      <PageHeader
        title={asset.name ?? asset.assetTag}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assets", href: "/assets" },
          { label: asset.assetTag },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/assets/${asset.id}/edit`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              Edit
            </Link>
            <DeleteButton action={deleteAsset.bind(null, asset.id)} label="Delete Asset" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-gray-800">{asset.assetTag}</p>
                  <p className="text-sm text-gray-500">{asset.model?.name ?? "Unknown Model"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {asset.status && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(asset.status.type)}`}>
                    {asset.status.name}
                  </span>
                )}
                {!isAssigned ? (
                  <CheckoutForm assetId={asset.id} />
                ) : (
                  <CheckinButton assetId={asset.id} />
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" /> Asset Details
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: "Asset Tag", value: asset.assetTag },
                { label: "Serial Number", value: asset.serial ?? "—" },
                { label: "Model", value: asset.model?.name ?? "—" },
                { label: "Category", value: asset.model?.category?.name ?? "—" },
                { label: "Manufacturer", value: asset.model?.manufacturer?.name ?? "—" },
                { label: "Order Number", value: asset.orderNumber ?? "—" },
                { label: "Purchase Cost", value: asset.purchaseCost ? formatCurrency(Number(asset.purchaseCost)) : "—" },
                { label: "Purchase Date", value: formatDate(asset.purchaseDate) },
                { label: "Warranty Months", value: asset.warrantyMonths ? `${asset.warrantyMonths} months` : "—" },
                { label: "Company", value: asset.company?.name ?? "—" },
                { label: "Location", value: asset.location?.name ?? "—" },
                { label: "RTD Location", value: asset.rtdLocation?.name ?? "—" },
                { label: "Supplier", value: asset.supplier?.name ?? "—" },
                { label: "Requestable", value: asset.requestable ? "Yes" : "No" },
                { label: "BYOD", value: asset.byod ? "Yes" : "No" },
                { label: "Last Checkout", value: formatDateTime(asset.lastCheckout) },
                { label: "Last Checkin", value: formatDateTime(asset.lastCheckin) },
                { label: "Last Audit", value: formatDateTime(asset.lastAuditDate) },
                { label: "Created", value: formatDateTime(asset.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm text-gray-700 mt-0.5">{value}</dd>
                </div>
              ))}
            </div>
            {asset.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Notes</dt>
                <dd className="text-sm text-gray-700 whitespace-pre-wrap">{asset.notes}</dd>
              </div>
            )}
          </div>

          {/* Maintenances */}
          {asset.maintenances.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-400" /> Maintenance Records
              </h2>
              <div className="space-y-3">
                {asset.maintenances.map(m => (
                  <div key={m.id} className="flex items-start justify-between border-b border-gray-50 pb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{m.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(m.startDate)} — {m.completionDate ? formatDate(m.completionDate) : "Ongoing"}</p>
                      {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
                    </div>
                    {m.supplierCost && <span className="text-sm font-medium text-gray-700">{formatCurrency(Number(m.supplierCost))}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned To */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" /> Assigned To
            </h2>
            {isAssigned ? (
              asset.assignedToType === "user" && asset.assignedUser ? (
                <Link href={`/users/${asset.assignedToId}`} className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {asset.assignedUser.firstName[0]}{asset.assignedUser.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{asset.assignedUser.firstName} {asset.assignedUser.lastName}</p>
                    <p className="text-xs text-gray-400">{asset.assignedUser.email ?? asset.assignedUser.username}</p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-gray-500">Assigned to {asset.assignedToType}</p>
              )
            ) : (
              <p className="text-sm text-gray-400 italic">Not currently assigned</p>
            )}
            {asset.expectedCheckin && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Expected return: <span className="text-gray-600">{formatDate(asset.expectedCheckin)}</span></p>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" /> Activity Log
            </h2>
            <div className="space-y-3">
              {asset.actionLogs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No activity recorded.</p>
              ) : asset.actionLogs.slice(0, 10).map(log => (
                <div key={log.id} className="text-xs">
                  <p className="font-medium text-gray-600 capitalize">{log.action}</p>
                  {log.user && <p className="text-gray-400">by {log.user.firstName} {log.user.lastName}</p>}
                  {log.note && <p className="text-gray-500 italic">{log.note}</p>}
                  <p className="text-gray-300">{formatDateTime(log.actionDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { getLicense } from "@/lib/queries";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteLicense } from "@/lib/actions/crud";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";
import { Key, Users } from "lucide-react";

export default async function LicenseDetailPage({ params }: { params: { id: string } }) {
  const license = await getLicense(parseInt(params.id));
  if (!license) notFound();
  const usedSeats = (license.seats_rel as any[]).filter((s: any) => s.userId || s.assetId).length;
  return (
    <div>
      <PageHeader title={license.name}
        breadcrumbs={[{ label: "Licenses", href: "/licenses" }, { label: license.name }]}
        actions={
          <div className="flex gap-2">
            <Link href={`/licenses/${license.id}/edit`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-3 py-1.5 rounded-lg">Edit</Link>
            <DeleteButton action={deleteLicense.bind(null, license.id)} label="Delete License" />
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-50 rounded-lg p-3"><Key className="h-6 w-6 text-indigo-600" /></div>
              <div>
                <h2 className="font-bold text-gray-800">{license.name}</h2>
                <p className="text-sm text-gray-500">{license.category?.name} · {license.manufacturer?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "License Key", value: license.serial ?? "—" },
                { label: "Seats", value: `${usedSeats} used / ${license.seats} total` },
                { label: "Licensed To", value: license.licensedTo ?? "—" },
                { label: "License Email", value: license.licenseEmail ?? "—" },
                { label: "Purchase Cost", value: license.purchaseCost ? formatCurrency(Number(license.purchaseCost)) : "—" },
                { label: "Purchase Date", value: formatDate(license.purchaseDate) },
                { label: "Expiration Date", value: formatDate(license.expirationDate) },
                { label: "Order Number", value: license.orderNumber ?? "—" },
                { label: "Supplier", value: license.supplier?.name ?? "—" },
                { label: "Company", value: license.company?.name ?? "—" },
                { label: "Reassignable", value: license.reassignable ? "Yes" : "No" },
                { label: "Maintained", value: license.maintained ? "Yes" : "No" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm text-gray-700 mt-0.5 break-all">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" /> Seats ({usedSeats}/{license.seats})
            </h2>
          </div>
          <div className="p-2">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${license.seats > 0 ? (usedSeats / license.seats) * 100 : 0}%` }} />
            </div>
            {(license.seats_rel as any[]).length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">No seats assigned.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(license.seats_rel as any[]).map((seat: any) => (
                  <div key={seat.id} className="px-3 py-2 text-sm">
                    {seat.user ? (
                      <Link href={`/users/${seat.user.id}`} className="text-blue-600 hover:underline">
                        {seat.user.firstName} {seat.user.lastName}
                      </Link>
                    ) : seat.asset ? (
                      <Link href={`/assets/${seat.asset.id}`} className="text-blue-600 hover:underline">
                        {seat.asset.assetTag} {seat.asset.name && `(${seat.asset.name})`}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Available seat</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

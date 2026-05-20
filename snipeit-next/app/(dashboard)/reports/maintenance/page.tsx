import { getMaintenanceLogs } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function MaintenanceReportPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const { items, total } = await getMaintenanceLogs({ page });

  return (
    <div>
      <PageHeader title="Maintenance Report" description="Asset maintenance history"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }, { label: "Maintenance" }]} />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Completion</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Warranty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No maintenance records found.</td></tr>
            ) : items.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5">
                  {r.asset && <Link href={`/assets/${r.asset.id}`} className="text-blue-600 hover:underline font-mono text-xs">{r.asset.assetTag}</Link>}
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-700">{r.title}</td>
                <td className="px-4 py-2.5 text-gray-500">{r.assetMaintenanceType ?? "—"}</td>
                <td className="px-4 py-2.5 text-gray-500">{formatDate(r.startDate)}</td>
                <td className="px-4 py-2.5">
                  {r.completionDate ? <Badge variant="success">{formatDate(r.completionDate)}</Badge> : <Badge variant="warning">In Progress</Badge>}
                </td>
                <td className="px-4 py-2.5 text-gray-700">{r.supplierCost ? formatCurrency(Number(r.supplierCost)) : "—"}</td>
                <td className="px-4 py-2.5">
                  {r.isWarranty ? <Badge variant="info">Warranty</Badge> : <span className="text-gray-400 text-xs">No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

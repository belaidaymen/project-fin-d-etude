import { getActivityLogs } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

const ACTION_META: Record<string, { label: string; color: "success" | "warning" | "danger" | "info" | "secondary" }> = {
  checkout: { label: "Checked Out", color: "warning" },
  checkin: { label: "Checked In", color: "success" },
  create: { label: "Created", color: "info" },
  update: { label: "Updated", color: "secondary" },
  delete: { label: "Deleted", color: "danger" },
  audit: { label: "Audited", color: "info" },
};

export default async function ActivityReportPage({ searchParams }: { searchParams: { page?: string; action?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const action = searchParams.action;
  const { logs, total } = await getActivityLogs({ page, action });
  const totalPages = Math.ceil(total / 50);

  return (
    <div>
      <PageHeader title="Activity Log" description={`${total.toLocaleString()} total activities recorded`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }, { label: "Activity Log" }]} />
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["", "checkout", "checkin", "create", "update", "delete"].map(a => (
          <Link key={a} href={a ? `/reports/activity?action=${a}` : "/reports/activity"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${action === a || (!action && !a) ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {a ? (ACTION_META[a]?.label ?? a) : "All Actions"}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Item</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No activity found.</td></tr>
            ) : logs.map((log: any) => {
              const meta = ACTION_META[log.action] ?? { label: log.action, color: "secondary" as const };
              const item = log.asset ? { label: `${log.asset.assetTag} ${log.asset.name ?? ""}`.trim(), href: `/assets/${log.asset.id}` }
                : log.license ? { label: log.license.name, href: `/licenses/${log.license.id}` }
                : log.accessory ? { label: log.accessory.name, href: `/accessories/${log.accessory.id}` }
                : null;
              return (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(log.actionDate)}</td>
                  <td className="px-4 py-2.5"><Badge variant={meta.color}>{meta.label}</Badge></td>
                  <td className="px-4 py-2.5">
                    {log.user ? <Link href={`/users/${log.user.id}`} className="text-blue-600 hover:underline text-sm">{log.user.firstName} {log.user.lastName}</Link>
                      : <span className="text-gray-400">System</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {item ? <Link href={item.href} className="text-blue-600 hover:underline text-sm">{item.label}</Link>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{log.note ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/reports/activity?page=${page-1}${action ? `&action=${action}` : ""}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50">Previous</Link>}
              {page < totalPages && <Link href={`/reports/activity?page=${page+1}${action ? `&action=${action}` : ""}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { getDashboardStats } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Package, Users, Key, Keyboard, Box, Cpu, Activity, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ACTION_LABELS: Record<string, { label: string; color: "success" | "warning" | "danger" | "info" | "secondary" }> = {
  checkout: { label: "Checked Out", color: "warning" },
  checkin: { label: "Checked In", color: "success" },
  create: { label: "Created", color: "info" },
  update: { label: "Updated", color: "secondary" },
  delete: { label: "Deleted", color: "danger" },
  audit: { label: "Audited", color: "info" },
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your IT asset inventory"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Assets" value={stats.totalAssets} href="/assets" color="blue"
          icon={<Package className="h-5 w-5" />} description={`${stats.deployedAssets} deployed`} />
        <StatCard title="Available Assets" value={stats.availableAssets} href="/assets" color="green"
          icon={<Package className="h-5 w-5" />} description="Ready to deploy" />
        <StatCard title="Total Users" value={stats.totalUsers} href="/users" color="purple"
          icon={<Users className="h-5 w-5" />} />
        <StatCard title="Licenses" value={stats.totalLicenses} href="/licenses" color="indigo"
          icon={<Key className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Accessories" value={stats.totalAccessories} href="/accessories" color="yellow"
          icon={<Keyboard className="h-5 w-5" />} />
        <StatCard title="Consumables" value={stats.totalConsumables} href="/consumables" color="yellow"
          icon={<Box className="h-5 w-5" />} />
        <StatCard title="Components" value={stats.totalComponents} href="/components" color="blue"
          icon={<Cpu className="h-5 w-5" />} />
        <StatCard title="Deployed" value={`${stats.totalAssets > 0 ? Math.round((stats.deployedAssets / stats.totalAssets) * 100) : 0}%`}
          color="green" icon={<Activity className="h-5 w-5" />} description="Utilization rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Activity className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentActivity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No activity yet.</p>
            ) : stats.recentActivity.map((log: any) => {
              const info = ACTION_LABELS[log.action] ?? { label: log.action, color: "secondary" as const };
              return (
                <div key={log.id} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                      </span>
                      {" — "}
                      {log.asset ? (
                        <span className="text-blue-600">{log.asset.assetTag} {log.asset.name && `(${log.asset.name})`}</span>
                      ) : log.note ?? ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.actionDate)}</p>
                  </div>
                  <Badge variant={info.color}>{info.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.lowStockAccessories.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">All stock levels are healthy.</p>
            ) : stats.lowStockAccessories.map((item: any) => (
              <div key={item.id} className="px-5 py-3">
                <p className="text-sm font-medium text-gray-700">{item.name}</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {item.qty} remaining (min: {item.minAmt})
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

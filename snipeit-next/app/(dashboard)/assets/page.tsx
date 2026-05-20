import { getAssets } from "@/lib/actions/assets";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { assets, total } = await getAssets({ search, page, perPage: 25 });

  const columns: Column<(typeof assets)[0]>[] = [
    {
      key: "assetTag",
      label: "Asset Tag",
      render: (row) => (
        <Link href={`/assets/${row.id}`} className="font-mono text-blue-600 hover:underline font-medium" onClick={e => e.stopPropagation()}>
          {row.assetTag}
        </Link>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-medium text-gray-800">{row.name ?? "—"}</span>,
    },
    {
      key: "model",
      label: "Model",
      render: (row) => (
        <div>
          <div className="text-gray-700">{row.model?.name ?? "—"}</div>
          {row.model?.category && <div className="text-xs text-gray-400">{row.model.category.name}</div>}
        </div>
      ),
    },
    {
      key: "serial",
      label: "Serial",
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.serial ?? "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => row.status ? (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status.type)}`}>
          {row.status.name}
        </span>
      ) : "—",
    },
    {
      key: "assignedUser",
      label: "Assigned To",
      render: (row) => row.assignedUser ? (
        <Link href={`/users/${row.assignedToId}`} className="text-blue-600 hover:underline text-sm" onClick={e => e.stopPropagation()}>
          {row.assignedUser.firstName} {row.assignedUser.lastName}
        </Link>
      ) : <span className="text-gray-400 text-sm">Unassigned</span>,
    },
    {
      key: "location",
      label: "Location",
      render: (row) => <span className="text-sm">{row.location?.name ?? "—"}</span>,
    },
    {
      key: "purchaseCost",
      label: "Cost",
      render: (row) => <span className="text-sm">{row.purchaseCost ? formatCurrency(Number(row.purchaseCost)) : "—"}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Manage all hardware assets"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assets" }]}
        actions={
          <Link href="/assets/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Add Asset
          </Link>
        }
      />
      <DataTable
        data={assets as any}
        columns={columns as any}
        total={total}
        page={page}
        perPage={25}
        searchQuery={search}
        searchPlaceholder="Search assets..."
        rowHref={(row) => `/assets/${row.id}`}
        emptyMessage="No assets found. Add your first asset to get started."
      />
    </div>
  );
}

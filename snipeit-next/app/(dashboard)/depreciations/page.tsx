import { getDepreciations, deleteDepreciation } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function DepreciationsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getDepreciations({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "months", label: "Term", render: (row) => <span className="text-sm">{row.months} months ({Math.round(row.months/12 * 10) / 10} years)</span> },
    { key: "type", label: "Method", render: (row) => <span className="capitalize text-sm">{row.type.replace("-", " ")}</span> },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
          <Link href={`/depreciations/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
          <DeleteButton action={deleteDepreciation.bind(null, row.id)} label="" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Depreciations" description="Define asset depreciation schedules"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Depreciations" }]}
        actions={<Link href="/depreciations/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Depreciation</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search depreciations..." />
    </div>
  );
}

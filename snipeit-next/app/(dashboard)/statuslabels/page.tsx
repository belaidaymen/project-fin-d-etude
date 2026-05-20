import { getStatusLabels, deleteStatusLabel } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

const typeColor: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  deployable: "success", pending: "warning", archived: "secondary", undeployable: "danger",
};

export default async function StatusLabelsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getStatusLabels({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    {
      key: "name", label: "Name", render: (row) => (
        <div className="flex items-center gap-2">
          {row.color && <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: row.color }} />}
          <span className="font-medium text-gray-800">{row.name}</span>
        </div>
      ),
    },
    { key: "type", label: "Type", render: (row) => <Badge variant={typeColor[row.type] ?? "secondary"}>{row.type}</Badge> },
    { key: "showInNav", label: "Show in Nav", render: (row) => row.showInNav ? <Badge variant="info">Yes</Badge> : <span className="text-gray-400 text-sm">No</span> },
    { key: "assets", label: "Assets", render: (row) => <span className="text-sm font-medium">{(row._count as any).assets}</span> },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
          <Link href={`/statuslabels/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
          <DeleteButton action={deleteStatusLabel.bind(null, row.id)} label="" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Status Labels" description="Define asset status types"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Status Labels" }]}
        actions={<Link href="/statuslabels/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Status</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search status labels..." />
    </div>
  );
}

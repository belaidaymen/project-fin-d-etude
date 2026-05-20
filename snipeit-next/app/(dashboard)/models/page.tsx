import { getAssetModels, deleteAssetModel } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function ModelsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getAssetModels({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "modelNumber", label: "Model #", render: (row) => <span className="font-mono text-xs text-gray-500">{row.modelNumber ?? "—"}</span> },
    { key: "manufacturer", label: "Manufacturer", render: (row) => row.manufacturer?.name ?? "—" },
    { key: "category", label: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "eol", label: "EOL (mo.)", render: (row) => row.eol ?? "—" },
    { key: "assets", label: "Assets", render: (row) => <span className="text-sm font-medium">{(row._count as any).assets}</span> },
    {
      key: "actions", label: "", render: (row) => (
        <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
          <Link href={`/models/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
          <DeleteButton action={deleteAssetModel.bind(null, row.id)} label="" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Asset Models" description="Manage asset model definitions"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Asset Models" }]}
        actions={<Link href="/models/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Model</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search models..." />
    </div>
  );
}

import { getManufacturers } from "@/lib/actions/crud";
import { deleteManufacturer } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function ManufacturersPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getManufacturers({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "url", label: "URL", render: (row) => row.url ? <a href={row.url} target="_blank" className="text-blue-600 hover:underline text-sm truncate max-w-[160px] block">{row.url}</a> : <span className="text-gray-400">—</span> },
    { key: "supportPhone", label: "Support Phone", render: (row) => row.supportPhone ?? "—" },
    { key: "supportEmail", label: "Support Email", render: (row) => row.supportEmail ?? "—" },
    { key: "models", label: "Models", render: (row) => <span className="text-sm font-medium">{(row._count as any).assetModels}</span> },
    { key: "actions", label: "", render: (row) => (
      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <Link href={`/manufacturers/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
        <DeleteButton action={deleteManufacturer.bind(null, row.id)} label="" />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Manufacturers" description="Manage hardware manufacturers"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Manufacturers" }]}
        actions={<Link href="/manufacturers/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Manufacturer</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search manufacturers..." />
    </div>
  );
}

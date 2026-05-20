import { getLocations } from "@/lib/actions/crud";
import { deleteLocation } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function LocationsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getLocations({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "parent", label: "Parent", render: (row) => row.parent?.name ?? "—" },
    { key: "city", label: "City", render: (row) => [row.city, row.state].filter(Boolean).join(", ") || "—" },
    { key: "country", label: "Country", render: (row) => row.country ?? "—" },
    { key: "users", label: "Users", render: (row) => <span className="text-sm">{(row._count as any).users}</span> },
    { key: "assets", label: "Assets", render: (row) => <span className="text-sm">{(row._count as any).assets}</span> },
    { key: "actions", label: "", render: (row) => (
      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <Link href={`/locations/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
        <DeleteButton action={deleteLocation.bind(null, row.id)} label="" />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Locations" description="Manage physical locations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Locations" }]}
        actions={<Link href="/locations/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Location</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search locations..." />
    </div>
  );
}

import { getSuppliers } from "@/lib/actions/crud";
import { deleteSupplier } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function SuppliersPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getSuppliers({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "contact", label: "Contact", render: (row) => row.contact ?? "—" },
    { key: "email", label: "Email", render: (row) => row.email ? <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline text-sm">{row.email}</a> : <span className="text-gray-400">—</span> },
    { key: "phone", label: "Phone", render: (row) => row.phone ?? "—" },
    { key: "city", label: "Location", render: (row) => [row.city, row.state, row.country].filter(Boolean).join(", ") || "—" },
    { key: "assets", label: "Assets", render: (row) => <span className="text-sm font-medium">{(row._count as any).assets}</span> },
    { key: "actions", label: "", render: (row) => (
      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <Link href={`/suppliers/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
        <DeleteButton action={deleteSupplier.bind(null, row.id)} label="" />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage hardware and software suppliers"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Suppliers" }]}
        actions={<Link href="/suppliers/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Supplier</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search suppliers..." />
    </div>
  );
}

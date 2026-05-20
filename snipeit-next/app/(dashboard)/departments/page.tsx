import { getDepartments, deleteDepartment } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

export default async function DepartmentsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getDepartments({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "company", label: "Company", render: (row) => row.company?.name ?? "—" },
    { key: "users", label: "Users", render: (row) => (row._count as any).users },
    { key: "actions", label: "", render: (row) => (
      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
        <Link href={`/departments/${row.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
        <DeleteButton action={deleteDepartment.bind(null, row.id)} label="" />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Departments" description="Manage departments"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Departments" }]}
        actions={<Link href="/departments/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Department</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search departments..." />
    </div>
  );
}

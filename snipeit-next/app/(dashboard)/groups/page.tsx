import { getGroups } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import Link from "next/link";

export default async function GroupsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getGroups({ search, page });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Group Name", render: (row: any) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "users", label: "Users", render: (row: any) => <span className="text-sm font-medium">{row._count.users}</span> },
    { key: "createdAt", label: "Created", render: (row: any) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <div>
      <PageHeader title="Groups" description="Manage user permission groups"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Groups" }]}
        actions={<Link href="/groups/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Group</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search groups..." emptyMessage="No groups created yet." />
    </div>
  );
}

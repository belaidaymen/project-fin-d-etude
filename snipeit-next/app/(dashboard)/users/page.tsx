import { getUsers } from "@/lib/actions/users";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { UserCheck, UserX } from "lucide-react";

export default async function UsersPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { users, total } = await getUsers({ search, page, perPage: 25 });

  const columns: Column<(typeof users)[0]>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Link href={`/users/${row.id}`} className="flex items-center gap-2 hover:text-blue-600" onClick={e => e.stopPropagation()}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <span className="font-medium text-gray-800">{row.firstName} {row.lastName}</span>
            {row.isAdmin && <span className="ml-1.5 text-xs text-blue-600 font-medium">(Admin)</span>}
          </div>
        </Link>
      ),
    },
    { key: "username", label: "Username", render: (row) => <span className="font-mono text-sm text-gray-600">@{row.username}</span> },
    { key: "email", label: "Email", render: (row) => <span className="text-sm text-gray-600">{row.email ?? "—"}</span> },
    { key: "jobtitle", label: "Title", render: (row) => <span className="text-sm">{row.jobtitle ?? "—"}</span> },
    { key: "company", label: "Company", render: (row) => <span className="text-sm">{row.company?.name ?? "—"}</span> },
    { key: "department", label: "Department", render: (row) => <span className="text-sm">{row.department?.name ?? "—"}</span> },
    { key: "assets", label: "Assets", render: (row) => <span className="text-sm font-medium">{(row._count as any).assignedAssets}</span> },
    {
      key: "activated",
      label: "Status",
      render: (row) => row.activated
        ? <Badge variant="success">Active</Badge>
        : <Badge variant="danger">Inactive</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all system users"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
        actions={
          <Link href="/users/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Add User
          </Link>
        }
      />
      <DataTable
        data={users as any}
        columns={columns as any}
        total={total}
        page={page}
        perPage={25}
        searchQuery={search}
        searchPlaceholder="Search users..."
        rowHref={(row) => `/users/${row.id}`}
        emptyMessage="No users found."
      />
    </div>
  );
}

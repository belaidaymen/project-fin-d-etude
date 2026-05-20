import { getCategories } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { deleteCategory } from "@/lib/actions/crud";
import { DeleteButton } from "@/components/shared/delete-button";
import Link from "next/link";

const TYPE_COLORS: Record<string, "default" | "success" | "warning" | "info" | "secondary"> = {
  asset: "default", license: "info", accessory: "warning", consumable: "success", component: "secondary",
};

export default async function CategoriesPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getCategories({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "type", label: "Type", render: (row) => <Badge variant={TYPE_COLORS[row.type] ?? "secondary"}>{row.type}</Badge> },
    { key: "items", label: "Items", render: (row) => {
      const count = Object.values(row._count as Record<string, number>).reduce((a, b) => a + b, 0);
      return <span className="text-sm font-medium">{count}</span>;
    }},
    { key: "requireAcceptance", label: "Requires Acceptance", render: (row) => row.requireAcceptance ? <Badge variant="warning">Yes</Badge> : <span className="text-gray-400 text-sm">No</span> },
    { key: "actions", label: "", render: (row) => (
      <div className="flex items-center gap-2 justify-end">
        <Link href={`/categories/${row.id}/edit`} className="text-xs text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Edit</Link>
        <DeleteButton action={deleteCategory.bind(null, row.id)} label="" />
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Categories" description="Organize assets by category"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Categories" }]}
        actions={<Link href="/categories/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Category</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search categories..." emptyMessage="No categories found." />
    </div>
  );
}

import { getComponents } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function ComponentsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getComponents({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "category", label: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "serial", label: "Serial", render: (row) => <span className="font-mono text-xs text-gray-500">{row.serial ?? "—"}</span> },
    { key: "qty", label: "Qty Remaining", render: (row) => {
      const low = row.minAmt != null && row.qty <= row.minAmt;
      return <Badge variant={low ? "warning" : "success"}>{row.qty}</Badge>;
    }},
    { key: "purchaseCost", label: "Cost", render: (row) => row.purchaseCost ? formatCurrency(Number(row.purchaseCost)) : "—" },
    { key: "assignments", label: "Installed", render: (row) => <span className="text-sm">{(row._count as any).assignments}</span> },
  ];

  return (
    <div>
      <PageHeader title="Components" description="Manage hardware components"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Components" }]}
        actions={<Link href="/components/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Component</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search components..." rowHref={(row) => `/components/${(row as any).id}`} />
    </div>
  );
}

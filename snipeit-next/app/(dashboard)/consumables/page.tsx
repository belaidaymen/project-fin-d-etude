import { getConsumables } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function ConsumablesPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getConsumables({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "category", label: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "qty", label: "Qty Remaining", render: (row) => {
      const low = row.minAmt != null && row.qty <= row.minAmt;
      return <Badge variant={low ? "warning" : "success"}>{row.qty}</Badge>;
    }},
    { key: "purchaseCost", label: "Cost", render: (row) => row.purchaseCost ? formatCurrency(Number(row.purchaseCost)) : "—" },
    { key: "assignments", label: "Used", render: (row) => <span className="text-sm">{(row._count as any).assignments}</span> },
  ];

  return (
    <div>
      <PageHeader title="Consumables" description="Manage consumable inventory"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Consumables" }]}
        actions={<Link href="/consumables/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Consumable</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search consumables..." rowHref={(row) => `/consumables/${(row as any).id}`} />
    </div>
  );
}

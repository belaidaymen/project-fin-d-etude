import { getAccessories } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function AccessoriesPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getAccessories({ search, page, perPage: 25 });

  type Row = (typeof items)[0];
  const columns: Column<Row>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "category", label: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "qty", label: "Quantity", render: (row) => {
      const low = row.minAmt != null && row.qty <= row.minAmt;
      return <Badge variant={low ? "warning" : "success"}>{row.qty} remaining</Badge>;
    }},
    { key: "location", label: "Location", render: (row) => row.location?.name ?? "—" },
    { key: "purchaseCost", label: "Cost (ea.)", render: (row) => row.purchaseCost ? formatCurrency(Number(row.purchaseCost)) : "—" },
    { key: "checkouts", label: "Checked Out", render: (row) => <span className="text-sm">{(row._count as any).checkouts}</span> },
  ];

  return (
    <div>
      <PageHeader title="Accessories" description="Manage accessories inventory"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Accessories" }]}
        actions={<Link href="/accessories/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Accessory</Link>}
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search accessories..." rowHref={(row) => `/accessories/${(row as any).id}`} />
    </div>
  );
}

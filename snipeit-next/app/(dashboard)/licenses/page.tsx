import { getLicenses } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function LicensesPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search ?? "";
  const { items, total } = await getLicenses({ search, page, perPage: 25 });

  type LicenseRow = (typeof items)[0];
  const columns: Column<LicenseRow>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-medium text-gray-800">{row.name}</span> },
    { key: "category", label: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "manufacturer", label: "Manufacturer", render: (row) => row.manufacturer?.name ?? "—" },
    { key: "serial", label: "License Key", render: (row) => <span className="font-mono text-xs text-gray-500">{row.serial ? `${row.serial.slice(0, 12)}...` : "—"}</span> },
    { key: "seats", label: "Seats", render: (row) => <span className="text-sm"><span className="font-medium text-green-600">{row.freeSeats}</span> / {row.seats} free</span> },
    { key: "expirationDate", label: "Expiration", render: (row) => {
      if (!row.expirationDate) return <span className="text-gray-400">—</span>;
      const expired = new Date(row.expirationDate) < new Date();
      return <Badge variant={expired ? "danger" : "success"}>{formatDate(row.expirationDate)}</Badge>;
    }},
    { key: "purchaseCost", label: "Cost", render: (row) => row.purchaseCost ? formatCurrency(Number(row.purchaseCost)) : "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Licenses"
        description="Manage software licenses and seats"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Licenses" }]}
        actions={
          <Link href="/licenses/create" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Add License
          </Link>
        }
      />
      <DataTable data={items as any} columns={columns as any} total={total} page={page} perPage={25}
        searchQuery={search} searchPlaceholder="Search licenses..." rowHref={(row) => `/licenses/${(row as any).id}`} />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function ComponentsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.component.findMany({ where, include: { manufacturer: true, category: true, location: true }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.component.count({ where }),
  ]);

  const columns = ["Name", "Model #", "Manufacturer", "Category", "Qty", "Location", "Cost", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/components/${item.id}` },
      { type: "text" as const, value: item.modelNumber ?? "—" },
      { type: "text" as const, value: item.manufacturer?.name ?? "—" },
      { type: "text" as const, value: item.category?.name ?? "—" },
      { type: "text" as const, value: item.qty.toString() },
      { type: "text" as const, value: item.location?.name ?? "—" },
      { type: "text" as const, value: item.purchaseCost ? `$${Number(item.purchaseCost).toFixed(2)}` : "—" },
    ],
    editHref: `/components/${item.id}/edit`,
    deleteUrl: `/api/components/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Components</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Components</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Component List</h3>
            <div style={{ float: "right", display: "flex", gap: 6 }}>
              <Link href="/components/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
              <button className="btn btn-default btn-sm"><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/components" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

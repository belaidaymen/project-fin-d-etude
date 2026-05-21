import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function SuppliersPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const search = searchParams?.search ?? "";
  const perPage = 20;

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.supplier.findMany({ where, include: { _count: { select: { assets: true } } }, orderBy: { name: "asc" }, skip: (parseInt(searchParams?.page ?? "1") - 1) * perPage, take: perPage }),
    prisma.supplier.count({ where }),
  ]);

  const columns = ["Name", "Contact", "Phone", "Email", "City", "Assets", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/suppliers/${item.id}` },
      { type: "text" as const, value: item.contact ?? "—" },
      { type: "text" as const, value: item.phone ?? "—" },
      { type: "text" as const, value: item.email ?? "—" },
      { type: "text" as const, value: item.city ?? "—" },
      { type: "badge" as const, value: item._count.assets.toString(), color: "info" as const },
    ],
    editHref: `/suppliers/${item.id}/edit`,
    deleteUrl: `/api/suppliers/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Suppliers</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Suppliers</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Supplier List</h3>
            <div style={{ float: "right" }}>
              <Link href="/suppliers/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/suppliers" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

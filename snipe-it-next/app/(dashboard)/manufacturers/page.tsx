import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function ManufacturersPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.manufacturer.findMany({ where, include: { _count: { select: { assetModels: true } } }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.manufacturer.count({ where }),
  ]);

  const columns = ["Name", "URL", "Support URL", "Support Phone", "Models", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/manufacturers/${item.id}` },
      { type: "text" as const, value: item.url ?? "—" },
      { type: "text" as const, value: item.supportUrl ?? "—" },
      { type: "text" as const, value: item.supportPhone ?? "—" },
      { type: "badge" as const, value: item._count.assetModels.toString(), color: "info" as const },
    ],
    editHref: `/manufacturers/${item.id}/edit`,
    deleteUrl: `/api/manufacturers/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Manufacturers</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Manufacturers</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Manufacturer List</h3>
            <div style={{ float: "right" }}>
              <Link href="/manufacturers/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/manufacturers" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

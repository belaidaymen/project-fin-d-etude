import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function ModelsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.assetModel.findMany({ where, include: { manufacturer: true, category: true, _count: { select: { assets: true } } }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.assetModel.count({ where }),
  ]);

  const columns = ["Name", "Model #", "Manufacturer", "Category", "EOL", "Assets", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/models/${item.id}` },
      { type: "text" as const, value: item.modelNumber ?? "—" },
      { type: "text" as const, value: item.manufacturer?.name ?? "—" },
      { type: "text" as const, value: item.category?.name ?? "—" },
      { type: "text" as const, value: item.eol ? `${item.eol} months` : "—" },
      { type: "badge" as const, value: item._count.assets.toString(), color: "info" as const },
    ],
    editHref: `/models/${item.id}/edit`,
    deleteUrl: `/api/models/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Asset Models</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Models</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Model List</h3>
            <div style={{ float: "right" }}>
              <Link href="/models/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/models" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

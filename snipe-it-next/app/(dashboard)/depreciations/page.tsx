import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function DepreciationsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = search ? { name: { contains: search, mode: "insensitive" } } : {};
  const [items, total] = await Promise.all([
    prisma.depreciation.findMany({
      where,
      include: { _count: { select: { assetModels: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.depreciation.count({ where }),
  ]);

  const columns = ["Name", "Term (months)", "Models", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "text" as const, value: item.name },
      { type: "text" as const, value: `${item.months} months` },
      { type: "badge" as const, value: item._count.assetModels.toString(), color: "info" as const },
    ],
    editHref: `/depreciations/${item.id}/edit`,
    deleteUrl: `/api/depreciations/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Depreciations <small>Asset Depreciation Schedules</small></h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Depreciations</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Depreciation List</h3>
            <div style={{ float: "right" }}>
              <Link href="/depreciations/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/depreciations" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

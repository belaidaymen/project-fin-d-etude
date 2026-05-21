import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function LocationsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.location.findMany({ where, include: { parent: true, _count: { select: { users: true, assets: true } } }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.location.count({ where }),
  ]);

  const columns = ["Name", "Parent", "City", "Country", "Users", "Assets", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/locations/${item.id}` },
      { type: "text" as const, value: item.parent?.name ?? "—" },
      { type: "text" as const, value: item.city ?? "—" },
      { type: "text" as const, value: item.country ?? "—" },
      { type: "badge" as const, value: item._count.users.toString(), color: "info" as const },
      { type: "badge" as const, value: item._count.assets.toString(), color: "info" as const },
    ],
    editHref: `/locations/${item.id}/edit`,
    deleteUrl: `/api/locations/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Locations</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Locations</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Location List</h3>
            <div style={{ float: "right" }}>
              <Link href="/locations/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/locations" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

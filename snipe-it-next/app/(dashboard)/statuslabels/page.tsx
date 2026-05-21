import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function StatusLabelsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.statuslabel.findMany({ where, include: { _count: { select: { assets: true } } }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.statuslabel.count({ where }),
  ]);

  const columns = ["Name", "Type", "Assets", "Deployable", "Pending", "Archived", "Show in Nav", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/statuslabels/${item.id}` },
      { type: "badge" as const, value: item.statusType, color: item.statusType === "deployable" ? "success" : item.statusType === "pending" ? "warning" : item.statusType === "archived" ? "default" : "danger" as any },
      { type: "badge" as const, value: item._count.assets.toString(), color: "info" as const },
      { type: "text" as const, value: item.deployable ? "✓" : "—" },
      { type: "text" as const, value: item.pending ? "✓" : "—" },
      { type: "text" as const, value: item.archived ? "✓" : "—" },
      { type: "text" as const, value: item.showInNav ? "✓" : "—" },
    ],
    editHref: `/statuslabels/${item.id}/edit`,
    deleteUrl: `/api/statuslabels/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Status Labels</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Status Labels</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Status Label List</h3>
            <div style={{ float: "right" }}>
              <Link href="/statuslabels/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/statuslabels" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

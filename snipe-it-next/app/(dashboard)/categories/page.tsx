import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import SimpleTable from "@/components/tables/SimpleTable";

export default async function CategoriesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const [items, total] = await Promise.all([
    prisma.category.findMany({ where, include: { _count: { select: { assetModels: true, accessories: true, licenses: true } } }, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.category.count({ where }),
  ]);

  const columns = ["Name", "Type", "Models", "Accessories", "Licenses", "EULA", "Accept", "Actions"];
  const rows = items.map(item => ({
    id: item.id,
    cells: [
      { type: "link" as const, value: item.name, href: `/categories/${item.id}` },
      { type: "badge" as const, value: item.categoryType, color: "info" as const },
      { type: "text" as const, value: item._count.assetModels.toString() },
      { type: "text" as const, value: item._count.accessories.toString() },
      { type: "text" as const, value: item._count.licenses.toString() },
      { type: "text" as const, value: item.eulaText ? "Yes" : "No" },
      { type: "text" as const, value: item.requireAcceptance ? "Yes" : "No" },
    ],
    editHref: `/categories/${item.id}/edit`,
    deleteUrl: `/api/categories/${item.id}`,
    deleteName: item.name,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Categories</h1>
        <ol className="breadcrumb"><li><a href="#">Home</a></li><li className="active">Categories</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Category List</h3>
            <div style={{ float: "right" }}>
              <Link href="/categories/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <SimpleTable columns={columns} rows={rows} total={total} page={page} perPage={perPage} basePath="/categories" search={search} />
          </div>
        </div>
      </section>
    </>
  );
}

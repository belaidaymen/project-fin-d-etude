import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default async function CategoriesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = search ? { nom: { contains: search, mode: "insensitive" } } : {};

  const [items, total] = await Promise.all([
    prisma.categorie.findMany({
      where,
      include: { _count: { select: { equipements: true } } },
      orderBy: { nom: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.categorie.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <section className="content-header">
        <h1>Catégories <small>Liste des catégories</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li className="active">Catégories</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Liste des catégories</h3>
            <div style={{ float: "right" }}>
              <Link href="/categories/create" className="btn btn-primary btn-sm">
                <Plus size={14} style={{ marginRight: 4 }} />Nouvelle catégorie
              </Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10 }}>
              <form method="GET" style={{ display: "flex", gap: 6 }}>
                <input name="search" className="form-control" style={{ width: 240 }} placeholder="Rechercher..." defaultValue={search} />
                <button type="submit" className="btn btn-default btn-sm">Chercher</button>
              </form>
              <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total} catégorie{total !== 1 ? "s" : ""}</span>
            </div>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Équipements</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucune catégorie trouvée.</td></tr>
                  ) : items.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ color: "#777", fontSize: 12 }}>{(page - 1) * perPage + idx + 1}</td>
                      <td>
                        <Link href={`/categories/${item.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                          {item.nom}
                        </Link>
                      </td>
                      <td style={{ color: "#555", fontSize: 13 }}>{item.description ?? "—"}</td>
                      <td>
                        <span className="badge" style={{ background: "#00a65a" }}>{item._count.equipements}</span>
                      </td>
                      <td>
                        <Link href={`/categories/${item.id}/edit`} className="btn btn-xs btn-default" style={{ marginRight: 4 }}>
                          <Pencil size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/categories?page=${page - 1}${search ? `&search=${search}` : ""}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}><Link href={`/categories?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link></li>
                  ))}
                  {page < totalPages && <li><Link href={`/categories?page=${page + 1}${search ? `&search=${search}` : ""}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

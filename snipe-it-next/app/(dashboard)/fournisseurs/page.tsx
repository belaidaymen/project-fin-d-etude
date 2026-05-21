import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function FournisseursPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const search = searchParams?.search ?? "";

  const where: any = search ? { OR: [{ nom: { contains: search, mode: "insensitive" } }, { contact: { contains: search, mode: "insensitive" } }] } : {};
  const items = await prisma.fournisseur.findMany({ where, include: { _count: { select: { equipements: true } } }, orderBy: { nom: "asc" } });
  const canEdit = ["ADMIN", "LOGISTICIEN", "MAGASINIER"].includes(role);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Fournisseurs</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Fournisseurs</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Liste des fournisseurs ({items.length})</h3>
            {canEdit && <Link href="/fournisseurs/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouveau fournisseur</Link>}
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8 }}>
              <input name="search" className="form-control" style={{ width: 280 }} placeholder="Rechercher un fournisseur..." defaultValue={search} />
              <button type="submit" className="btn btn-default">Rechercher</button>
              {search && <Link href="/fournisseurs" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Nom</th>
                    <th style={{ padding: "10px 12px" }}>Contact</th>
                    <th style={{ padding: "10px 12px" }}>Email</th>
                    <th style={{ padding: "10px 12px" }}>Téléphone</th>
                    <th style={{ padding: "10px 12px" }}>Équipements</th>
                    {canEdit && <th style={{ padding: "10px 12px" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucun fournisseur trouvé.</td></tr>}
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>{item.nom}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.contact ?? "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.email ? <a href={`mailto:${item.email}`} style={{ color: "#3c8dbc" }}>{item.email}</a> : "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{item.telephone ?? "—"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ fontSize: 12, padding: "2px 8px", background: "#f4f4f4", borderRadius: 10 }}>{item._count.equipements}</span>
                      </td>
                      {canEdit && (
                        <td style={{ padding: "10px 12px" }}>
                          <Link href={`/fournisseurs/${item.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

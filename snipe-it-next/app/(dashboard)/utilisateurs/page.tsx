import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, UserCheck, UserX } from "lucide-react";

const ROLE_LABELS: Record<string, string> = { ADMIN: "Administrateur", LOGISTICIEN: "Resp. Logistique", MAGASINIER: "Magasinier", CHEF_LABO: "Resp. Laboratoire" };
const ROLE_COLORS: Record<string, string> = { ADMIN: "#dd4b39", LOGISTICIEN: "#3c8dbc", MAGASINIER: "#00a65a", CHEF_LABO: "#f39c12" };

export default async function UtilisateursPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  if (!["ADMIN", "LOGISTICIEN"].includes(role)) redirect("/dashboard");

  const search = searchParams?.search ?? "";
  const roleFilter = searchParams?.role ?? "";

  const where: any = {};
  if (search) where.OR = [{ nom: { contains: search, mode: "insensitive" } }, { prenom: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
  if (roleFilter) where.role = roleFilter;

  const users = await prisma.user.findMany({ where, include: { localisation: true }, orderBy: [{ nom: "asc" }] });

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Utilisateurs</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Utilisateurs</li></ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="box-title">Comptes utilisateurs ({users.length})</h3>
            {role === "ADMIN" && <Link href="/utilisateurs/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Nouvel utilisateur</Link>}
          </div>
          <div className="box-body" style={{ padding: "12px 15px", borderBottom: "1px solid #f4f4f4" }}>
            <form method="GET" style={{ display: "flex", gap: 8 }}>
              <input name="search" className="form-control" style={{ width: 240 }} placeholder="Rechercher..." defaultValue={search} />
              <select name="role" className="form-control" style={{ width: 200 }} defaultValue={roleFilter}>
                <option value="">Tous les rôles</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="submit" className="btn btn-default">Filtrer</button>
              {(search || roleFilter) && <Link href="/utilisateurs" className="btn btn-default">Réinitialiser</Link>}
            </form>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ padding: "10px 12px" }}>Nom</th>
                    <th style={{ padding: "10px 12px" }}>Identifiant</th>
                    <th style={{ padding: "10px 12px" }}>Email</th>
                    <th style={{ padding: "10px 12px" }}>Rôle</th>
                    <th style={{ padding: "10px 12px" }}>Localisation</th>
                    <th style={{ padding: "10px 12px" }}>Statut</th>
                    {role === "ADMIN" && <th style={{ padding: "10px 12px" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucun utilisateur trouvé.</td></tr>}
                  {users.map(user => (
                    <tr key={user.id}>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 500 }}>{user.prenom} {user.nom}</div>
                        {user.telephone && <div style={{ fontSize: 11, color: "#999" }}>{user.telephone}</div>}
                      </td>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 13 }}>{user.username}</td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}><a href={`mailto:${user.email}`} style={{ color: "#3c8dbc" }}>{user.email}</a></td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: (ROLE_COLORS[user.role] ?? "#ccc") + "22", color: ROLE_COLORS[user.role] ?? "#333", fontWeight: 600 }}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 13 }}>{user.localisation?.nom ?? "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        {user.actif
                          ? <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: "#00a65a22", color: "#00a65a", fontWeight: 600 }}>Actif</span>
                          : <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: "#77777722", color: "#777", fontWeight: 600 }}>Inactif</span>}
                      </td>
                      {role === "ADMIN" && (
                        <td style={{ padding: "10px 12px" }}>
                          <Link href={`/utilisateurs/${user.id}/edit`} className="btn btn-warning btn-xs">Modifier</Link>
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

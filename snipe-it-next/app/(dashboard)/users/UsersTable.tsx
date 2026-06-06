"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  jobTitle: string | null;
  phone: string | null;
  laboratoire: string | null;
  activated: boolean;
  createdAt: string;
}

interface Props { users: User[]; total: number; page: number; perPage: number; search: string; }

const ROLE_LABELS: Record<string, string> = {
  LOGISTIQUE: "Logistique",
  MAGASINIER: "Magasinier",
  LABORATOIRE: "Laboratoire",
};

const ROLE_COLORS: Record<string, string> = {
  LOGISTIQUE: "#3c8dbc",
  MAGASINIER: "#00a65a",
  LABORATOIRE: "#f39c12",
};

export default function UsersTable({ users, total, page, perPage, search }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/users?search=${searchVal}`);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input className="form-control" style={{ width: 240 }} placeholder="Rechercher un utilisateur..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          <button type="submit" className="btn btn-default btn-sm"><Search size={14} /></button>
        </form>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString("fr-FR")} utilisateur{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Identifiant</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Poste</th>
              <th>Laboratoire</th>
              <th>Statut</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#999" }}>Aucun utilisateur trouvé. <Link href="/users/create" style={{ color: "#337ab7" }}>En créer un.</Link></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <Link href={`/users/${u.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                    {u.name}
                  </Link>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.username}</td>
                <td style={{ fontSize: 13 }}>{u.email}</td>
                <td>
                  <span style={{
                    background: (ROLE_COLORS[u.role] ?? "#777") + "20",
                    color: ROLE_COLORS[u.role] ?? "#777",
                    padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                  }}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                </td>
                <td>{u.jobTitle ?? "—"}</td>
                <td>{u.laboratoire ?? "—"}</td>
                <td>
                  {u.activated
                    ? <span className="label label-success">Actif</span>
                    : <span className="label label-danger">Inactif</span>}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 3 }}>
                    <Link href={`/users/${u.id}`} className="btn btn-info btn-xs"><Eye size={12} /></Link>
                    <Link href={`/users/${u.id}/edit`} className="btn btn-warning btn-xs"><Edit size={12} /></Link>
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u.id, u.name)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
          <ul className="pagination" style={{ margin: 0 }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <li key={p} className={p === page ? "active" : ""}>
                <Link href={`/users?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

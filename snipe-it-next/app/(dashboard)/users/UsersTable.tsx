"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye, Shield } from "lucide-react";

interface User {
  id: string; name: string; username: string; email: string;
  jobTitle: string | null; phone: string | null; company: string | null;
  location: string | null; department: string | null;
  activated: boolean; isSuperAdmin: boolean; assetCount: number; createdAt: string;
}

interface Props { users: User[]; total: number; page: number; perPage: number; search: string; }

export default function UsersTable({ users, total, page, perPage, search }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/users?search=${searchVal}`);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input className="form-control" style={{ width: 240 }} placeholder="Search users..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          <button type="submit" className="btn btn-default btn-sm"><Search size={14} /></button>
        </form>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString()} user{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Assets</th>
              <th>Status</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#999" }}>No users found. <Link href="/users/create" style={{ color: "#337ab7" }}>Create one.</Link></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <Link href={`/users/${u.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                    {u.isSuperAdmin && <Shield size={12} style={{ color: "#d9534f", marginRight: 4 }} />}
                    {u.name}
                  </Link>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{u.username}</td>
                <td style={{ fontSize: 13 }}>{u.email}</td>
                <td>{u.jobTitle ?? "—"}</td>
                <td>{u.department ?? "—"}</td>
                <td>{u.location ?? "—"}</td>
                <td>
                  <span className={`label ${u.assetCount > 0 ? "label-info" : "label-default"}`}>
                    {u.assetCount}
                  </span>
                </td>
                <td>
                  {u.activated
                    ? <span className="label label-success">Active</span>
                    : <span className="label label-danger">Inactive</span>}
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

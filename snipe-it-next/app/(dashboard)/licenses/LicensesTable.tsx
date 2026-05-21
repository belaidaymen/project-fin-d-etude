"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface License {
  id: string;
  name: string;
  serial: string | null;
  seats: number;
  manufacturer: string | null;
  category: string | null;
  company: string | null;
  maintained: boolean;
  expirationDate: string | null;
  purchaseCost: string | null;
  usedSeats: number;
}

interface Props { licenses: License[]; total: number; page: number; perPage: number; search: string; }

export default function LicensesTable({ licenses, total, page, perPage, search }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/licenses?search=${searchVal}`);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete license "${name}"?`)) return;
    await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input className="form-control" style={{ width: 240 }} placeholder="Search licenses..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          <button type="submit" className="btn btn-default btn-sm"><Search size={14} /></button>
        </form>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString()} license{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Serial</th>
              <th>Manufacturer</th>
              <th>Seats</th>
              <th>Remaining</th>
              <th>Expiration</th>
              <th>Maintained</th>
              <th>Cost</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {licenses.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", padding: 30, color: "#999" }}>No licenses found. <Link href="/licenses/create" style={{ color: "#337ab7" }}>Create one.</Link></td></tr>
            ) : licenses.map(l => (
              <tr key={l.id}>
                <td><Link href={`/licenses/${l.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>{l.name}</Link></td>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{l.serial ?? "—"}</td>
                <td>{l.manufacturer ?? "—"}</td>
                <td>{l.seats}</td>
                <td>
                  <span className={`label ${l.seats - l.usedSeats > 0 ? "label-success" : "label-danger"}`}>
                    {l.seats - l.usedSeats}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>{l.expirationDate ? new Date(l.expirationDate).toLocaleDateString() : "—"}</td>
                <td>{l.maintained ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</td>
                <td>{l.purchaseCost ? `$${parseFloat(l.purchaseCost).toFixed(2)}` : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 3 }}>
                    <Link href={`/licenses/${l.id}`} className="btn btn-info btn-xs"><Eye size={12} /></Link>
                    <Link href={`/licenses/${l.id}/edit`} className="btn btn-warning btn-xs"><Edit size={12} /></Link>
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(l.id, l.name)}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: "10px 15px", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <ul className="pagination" style={{ margin: 0 }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <li key={p} className={p === page ? "active" : ""}>
                <Link href={`/licenses?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

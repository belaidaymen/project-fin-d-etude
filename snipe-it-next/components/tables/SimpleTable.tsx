"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface Cell {
  type: "text" | "link" | "badge";
  value: string;
  href?: string;
  color?: "success" | "danger" | "warning" | "info" | "default";
}

interface Row {
  id: string;
  cells: Cell[];
  editHref?: string;
  deleteUrl?: string;
  deleteName?: string;
  viewHref?: string;
}

interface Props {
  columns: string[];
  rows: Row[];
  total: number;
  page: number;
  perPage: number;
  basePath: string;
  search?: string;
}

const BADGE_COLORS = {
  success: "#5cb85c",
  danger: "#d9534f",
  warning: "#f0ad4e",
  info: "#5bc0de",
  default: "#777",
};

export default function SimpleTable({ columns, rows, total, page, perPage, basePath, search = "" }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${basePath}?search=${encodeURIComponent(searchVal)}`);
  }

  async function handleDelete(url: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(url, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input className="form-control" style={{ width: 240 }} placeholder="Search..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
          <button type="submit" className="btn btn-default btn-sm"><Search size={14} /></button>
        </form>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString()} item{total !== 1 ? "s" : ""}</span>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 30, color: "#999" }}>
                  No items found.{" "}
                  <Link href={`${basePath}/create`} style={{ color: "#337ab7" }}>Create one.</Link>
                </td>
              </tr>
            ) : rows.map(row => (
              <tr key={row.id}>
                {row.cells.map((cell, i) => (
                  <td key={i}>
                    {cell.type === "link" && cell.href ? (
                      <Link href={cell.href} style={{ color: "#337ab7", fontWeight: 600 }}>{cell.value}</Link>
                    ) : cell.type === "badge" ? (
                      <span className="status-badge" style={{ background: BADGE_COLORS[cell.color ?? "default"] }}>{cell.value}</span>
                    ) : (
                      cell.value
                    )}
                  </td>
                ))}
                <td>
                  <div style={{ display: "flex", gap: 3 }}>
                    {row.viewHref && <Link href={row.viewHref} className="btn btn-info btn-xs"><Eye size={12} /></Link>}
                    {row.editHref && <Link href={row.editHref} className="btn btn-warning btn-xs"><Edit size={12} /></Link>}
                    {row.deleteUrl && (
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(row.deleteUrl!, row.deleteName ?? "item")}>
                        <Trash2 size={12} />
                      </button>
                    )}
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
            <li className={page <= 1 ? "disabled" : ""}>
              <Link href={`${basePath}?page=${page - 1}${search ? `&search=${search}` : ""}`}>«</Link>
            </li>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <li key={p} className={p === page ? "active" : ""}>
                <Link href={`${basePath}?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link>
              </li>
            ))}
            <li className={page >= totalPages ? "disabled" : ""}>
              <Link href={`${basePath}?page=${page + 1}${search ? `&search=${search}` : ""}`}>»</Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

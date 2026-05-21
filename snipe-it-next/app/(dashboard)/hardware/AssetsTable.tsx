"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye, ArrowUpDown, LogIn, LogOut } from "lucide-react";

interface Asset {
  id: string;
  assetTag: string;
  name: string | null;
  serial: string | null;
  model: string | null;
  manufacturer: string | null;
  category: string | null;
  status: { name: string; type: string; color: string | null } | null;
  assignedTo: string | null;
  assignedToId: string | null;
  location: string | null;
  purchaseDate: string | null;
  purchaseCost: string | null;
  createdAt: string;
}

interface Props {
  assets: Asset[];
  total: number;
  page: number;
  perPage: number;
  search: string;
  statusFilter: string;
}

const STATUS_COLORS: Record<string, string> = {
  deployable: "#337ab7",
  pending: "#f0ad4e",
  archived: "#777",
  undeployable: "#d9534f",
};

export default function AssetsTable({ assets, total, page, perPage, search, statusFilter }: Props) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);
  const totalPages = Math.ceil(total / perPage);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchVal) params.set("search", searchVal);
    if (statusFilter) params.set("status", statusFilter);
    router.push(`/hardware?${params.toString()}`);
  }

  async function handleDelete(id: string, tag: string) {
    if (!confirm(`Delete asset ${tag}? This cannot be undone.`)) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6 }}>
          <input
            className="form-control"
            style={{ width: 240 }}
            placeholder="Search assets..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
          <button type="submit" className="btn btn-default btn-sm">
            <Search size={14} />
          </button>
        </form>
        <select
          className="form-control"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={e => {
            const params = new URLSearchParams();
            if (searchVal) params.set("search", searchVal);
            if (e.target.value) params.set("status", e.target.value);
            router.push(`/hardware?${params.toString()}`);
          }}
        >
          <option value="">All Statuses</option>
          <option value="deployable">Deployable</option>
          <option value="pending">Pending</option>
          <option value="archived">Archived</option>
          <option value="undeployable">Undeployable</option>
        </select>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>
          {total.toLocaleString()} asset{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" /></th>
              <th>Asset Tag</th>
              <th>Name</th>
              <th>Model</th>
              <th>Serial</th>
              <th>Status</th>
              <th>Checked Out To</th>
              <th>Location</th>
              <th>Purchase Date</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                  No assets found.{" "}
                  <Link href="/hardware/create" style={{ color: "#337ab7" }}>Create one now.</Link>
                </td>
              </tr>
            ) : (
              assets.map(asset => (
                <tr key={asset.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <Link href={`/hardware/${asset.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                      {asset.assetTag}
                    </Link>
                  </td>
                  <td>{asset.name ?? <span style={{ color: "#999" }}>—</span>}</td>
                  <td>
                    {asset.manufacturer && <span style={{ color: "#777", fontSize: 12 }}>{asset.manufacturer} — </span>}
                    {asset.model ?? <span style={{ color: "#999" }}>—</span>}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{asset.serial ?? "—"}</td>
                  <td>
                    {asset.status ? (
                      <span
                        className="status-badge"
                        style={{ background: asset.status.color || STATUS_COLORS[asset.status.type] || "#777" }}
                      >
                        {asset.status.name}
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    {asset.assignedTo ? (
                      <Link href={`/users/${asset.assignedToId}`} style={{ color: "#337ab7" }}>
                        {asset.assignedTo}
                      </Link>
                    ) : <span style={{ color: "#999" }}>—</span>}
                  </td>
                  <td>{asset.location ?? "—"}</td>
                  <td style={{ fontSize: 12 }}>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 3 }}>
                      <Link href={`/hardware/${asset.id}`} className="btn btn-info btn-xs" title="View">
                        <Eye size={12} />
                      </Link>
                      <Link href={`/hardware/${asset.id}/edit`} className="btn btn-warning btn-xs" title="Edit">
                        <Edit size={12} />
                      </Link>
                      {asset.assignedToId ? (
                        <Link href={`/hardware/${asset.id}/checkin`} className="btn btn-primary btn-xs" title="Check In">
                          <LogIn size={12} />
                        </Link>
                      ) : (
                        <Link href={`/hardware/${asset.id}/checkout`} className="btn btn-success btn-xs" title="Check Out">
                          <LogOut size={12} />
                        </Link>
                      )}
                      <button
                        className="btn btn-danger btn-xs"
                        title="Delete"
                        onClick={() => handleDelete(asset.id, asset.assetTag)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: "10px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#777", fontSize: 13 }}>
            Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}
          </span>
          <ul className="pagination" style={{ margin: 0 }}>
            <li className={page <= 1 ? "disabled" : ""}>
              <Link href={`/hardware?page=${page - 1}${search ? `&search=${search}` : ""}`}>«</Link>
            </li>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <li key={p} className={p === page ? "active" : ""}>
                  <Link href={`/hardware?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link>
                </li>
              );
            })}
            <li className={page >= totalPages ? "disabled" : ""}>
              <Link href={`/hardware?page=${page + 1}${search ? `&search=${search}` : ""}`}>»</Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

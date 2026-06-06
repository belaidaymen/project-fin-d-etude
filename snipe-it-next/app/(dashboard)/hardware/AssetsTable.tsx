"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface Asset {
  id: string;
  assetTag: string;
  name: string | null;
  serial: string | null;
  reference: string | null;
  category: string | null;
  status: { name: string; color: string | null } | null;
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

const STATUS_OPTIONS = [
  "Disponible",
  "En service",
  "En maintenance",
  "Hors service",
  "Réservé",
  "En prêt",
];

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
    if (!confirm(`Supprimer l'équipement ${tag} ? Cette action est irréversible.`)) return;
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
            placeholder="Rechercher des équipements..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
          <button type="submit" className="btn btn-default btn-sm">
            <Search size={14} />
          </button>
        </form>
        <select
          className="form-control"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={e => {
            const params = new URLSearchParams();
            if (searchVal) params.set("search", searchVal);
            if (e.target.value) params.set("status", e.target.value);
            router.push(`/hardware?${params.toString()}`);
          }}
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>
          {total.toLocaleString("fr-FR")} équipement{total !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" /></th>
              <th>Étiquette</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>N° Série</th>
              <th>Statut</th>
              <th>Emplacement</th>
              <th>Date d'achat</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                  Aucun équipement trouvé.{" "}
                  <Link href="/hardware/create" style={{ color: "#337ab7" }}>En créer un.</Link>
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
                  <td style={{ color: "#666", fontSize: 12 }}>{asset.category ?? <span style={{ color: "#999" }}>—</span>}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{asset.serial ?? "—"}</td>
                  <td>
                    {asset.status ? (
                      <span
                        className="status-badge"
                        style={{ background: asset.status.color ?? "#777" }}
                      >
                        {asset.status.name}
                      </span>
                    ) : <span style={{ color: "#999" }}>—</span>}
                  </td>
                  <td style={{ fontSize: 13 }}>{asset.location ?? <span style={{ color: "#999" }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString("fr-FR") : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 3 }}>
                      <Link href={`/hardware/${asset.id}`} className="btn btn-info btn-xs" title="Voir">
                        <Eye size={12} />
                      </Link>
                      <Link href={`/hardware/${asset.id}/edit`} className="btn btn-warning btn-xs" title="Modifier">
                        <Edit size={12} />
                      </Link>
                      <button
                        className="btn btn-danger btn-xs"
                        title="Supprimer"
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
            Affichage {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} sur {total}
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

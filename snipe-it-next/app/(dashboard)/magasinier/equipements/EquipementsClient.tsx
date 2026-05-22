"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, X } from "lucide-react";

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  reference: string | null;
  serial: string | null;
  quantity: number;
  purchaseCost: number | null;
  purchaseDate: string | null;
  notes: string | null;
  category: { id: string; name: string } | null;
  location: { id: string; name: string } | null;
  status: { id: string; name: string; color: string | null } | null;
}

interface Ref { id: string; name: string }
interface StatusRef { id: string; name: string; color: string | null }

export default function EquipementsClient({
  assets: initial,
  categories,
  locations,
  statuses,
}: {
  assets: Asset[];
  categories: Ref[];
  locations: Ref[];
  statuses: StatusRef[];
}) {
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openNew();
    }
  }, []);
  const [form, setForm] = useState({
    assetTag: "", name: "", reference: "", serial: "",
    quantity: "1", purchaseCost: "", purchaseDate: "",
    categoryId: "", locationId: "", statusId: "", notes: "",
  });

  const filtered = assets.filter(a =>
    search === "" ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
    (a.reference ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setEditAsset(null);
    setForm({ assetTag: `EQ-${String(assets.length + 1).padStart(3, "0")}`, name: "", reference: "", serial: "", quantity: "1", purchaseCost: "", purchaseDate: "", categoryId: categories[0]?.id ?? "", locationId: locations[0]?.id ?? "", statusId: statuses[0]?.id ?? "", notes: "" });
    setShowForm(true);
  }

  function openEdit(a: Asset) {
    setEditAsset(a);
    setForm({
      assetTag: a.assetTag, name: a.name, reference: a.reference ?? "",
      serial: a.serial ?? "", quantity: String(a.quantity),
      purchaseCost: a.purchaseCost != null ? String(a.purchaseCost) : "",
      purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : "",
      categoryId: a.category?.id ?? "", locationId: a.location?.id ?? "",
      statusId: a.status?.id ?? "", notes: a.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        quantity: Number(form.quantity),
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
        purchaseDate: form.purchaseDate || null,
      };
      const url = editAsset ? `/api/equipements/${editAsset.id}` : "/api/equipements";
      const method = editAsset ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editAsset) {
          setAssets(prev => prev.map(a => a.id === saved.id ? saved : a));
        } else {
          setAssets(prev => [saved, ...prev]);
        }
        setShowForm(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Gestion des Équipements</h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>Enregistrer et mettre à jour les fiches matériel</p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            background: "#00a65a", color: "white", border: "none", borderRadius: 6,
            cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={15} /> Enregistrer un équipement
        </button>
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom, tag, référence..."
        className="form-control"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ maxWidth: 340, marginBottom: 16 }}
      />

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                {["Tag", "Nom", "Référence", "Catégorie", "Localisation", "État", "Qté", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "32px 14px", textAlign: "center", color: "#aaa" }}>Aucun équipement</td></tr>
              ) : filtered.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#00a65a", fontWeight: 600 }}>{a.assetTag}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "#333" }}>{a.name}</td>
                  <td style={{ padding: "10px 14px", color: "#777" }}>{a.reference ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#777" }}>{a.category?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#777" }}>{a.location?.name ?? "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {a.status && (
                      <span style={{
                        padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: (a.status.color ?? "#888") + "20", color: a.status.color ?? "#888",
                      }}>
                        {a.status.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#777", textAlign: "center" }}>{a.quantity}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => openEdit(a)}
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#f0f7ff", color: "#3c8dbc", border: "1px solid #c8dff7", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: "100%", maxWidth: 560, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#333" }}>
                {editAsset ? "Modifier l'équipement" : "Enregistrer un équipement"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Tag équipement *</label>
                  <input className="form-control" value={form.assetTag} onChange={e => setForm(p => ({ ...p, assetTag: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Nom *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Référence</label>
                  <input className="form-control" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>N° de série</label>
                  <input className="form-control" value={form.serial} onChange={e => setForm(p => ({ ...p, serial: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Catégorie</label>
                  <select className="form-control" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">— Sélectionner —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Localisation</label>
                  <select className="form-control" value={form.locationId} onChange={e => setForm(p => ({ ...p, locationId: e.target.value }))}>
                    <option value="">— Sélectionner —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>État</label>
                  <select className="form-control" value={form.statusId} onChange={e => setForm(p => ({ ...p, statusId: e.target.value }))}>
                    <option value="">— Sélectionner —</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Quantité</label>
                  <input type="number" min="1" className="form-control" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Coût d'achat (DA)</label>
                  <input type="number" step="0.01" className="form-control" value={form.purchaseCost} onChange={e => setForm(p => ({ ...p, purchaseCost: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Date d'achat</label>
                  <input type="date" className="form-control" value={form.purchaseDate} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Notes</label>
                <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-default" disabled={loading}>Annuler</button>
                <button type="submit" disabled={loading} style={{ padding: "8px 22px", background: "#00a65a", color: "white", border: "none", borderRadius: 4, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Enregistrement..." : editAsset ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

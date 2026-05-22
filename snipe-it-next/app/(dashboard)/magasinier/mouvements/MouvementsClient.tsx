"use client";

import { useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw, X } from "lucide-react";

interface Movement {
  id: string;
  type: string;
  quantity: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
  asset: { assetTag: string; name: string };
  fromLocation: { name: string } | null;
  toLocation: { name: string } | null;
  doneBy: { firstName: string; lastName: string };
}

interface AssetRef { id: string; assetTag: string; name: string }
interface LocationRef { id: string; name: string }

const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ENTREE: { label: "Entrée", color: "#00a65a", icon: <ArrowDownCircle size={13} /> },
  SORTIE: { label: "Sortie", color: "#d9534f", icon: <ArrowUpCircle size={13} /> },
  TRANSFERT: { label: "Transfert", color: "#3c8dbc", icon: <RefreshCw size={13} /> },
};

export default function MouvementsClient({
  mouvements: initial,
  assets,
  locations,
}: {
  mouvements: Movement[];
  assets: AssetRef[];
  locations: LocationRef[];
}) {
  const [mouvements, setMouvements] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [form, setForm] = useState({
    type: "ENTREE",
    assetId: assets[0]?.id ?? "",
    fromLocationId: "",
    toLocationId: "",
    quantity: "1",
    reference: "",
    note: "",
  });

  const filtered = filterType === "ALL" ? mouvements : mouvements.filter(m => m.type === filterType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/mouvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      if (res.ok) {
        const saved = await res.json();
        setMouvements(prev => [saved, ...prev]);
        setShowForm(false);
        setForm({ type: "ENTREE", assetId: assets[0]?.id ?? "", fromLocationId: "", toLocationId: "", quantity: "1", reference: "", note: "" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Mouvements d'Équipements</h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>Historique des entrées, sorties et transferts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#00a65a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          <Plus size={15} /> Nouveau mouvement
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["ALL", "ENTREE", "SORTIE", "TRANSFERT"].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            style={{
              padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600,
              border: filterType === t ? "none" : "1px solid #e0e0e0",
              background: filterType === t ? "#00a65a" : "#fff",
              color: filterType === t ? "white" : "#555",
              cursor: "pointer",
            }}
          >
            {t === "ALL" ? "Tous" : typeConfig[t]?.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.08)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                {["Type", "Équipement", "De", "Vers", "Qté", "Référence", "Note", "Par", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "32px 14px", textAlign: "center", color: "#aaa" }}>Aucun mouvement enregistré</td></tr>
              ) : filtered.map((m, i) => {
                const tc = typeConfig[m.type] ?? typeConfig.ENTREE;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: tc.color + "18", color: tc.color }}>
                        {tc.icon} {tc.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600, color: "#333", fontSize: 12 }}>{m.asset.name}</div>
                      <div style={{ color: "#00a65a", fontFamily: "monospace", fontSize: 11 }}>{m.asset.assetTag}</div>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#666", fontSize: 12 }}>{m.fromLocation?.name ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#666", fontSize: 12 }}>{m.toLocation?.name ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#666", textAlign: "center" }}>{m.quantity}</td>
                    <td style={{ padding: "10px 14px", color: "#888", fontSize: 11, fontFamily: "monospace" }}>{m.reference ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#666", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.note ?? ""}>{m.note ?? "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#666", fontSize: 12 }}>{m.doneBy.firstName} {m.doneBy.lastName}</td>
                    <td style={{ padding: "10px 14px", color: "#aaa", fontSize: 11 }}>{new Date(m.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: "100%", maxWidth: 500, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#333" }}>Enregistrer un mouvement</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Type de mouvement *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["ENTREE", "SORTIE", "TRANSFERT"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, type: t }))}
                      style={{
                        flex: 1, padding: "8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                        border: form.type === t ? "none" : "1px solid #e0e0e0",
                        background: form.type === t ? (typeConfig[t]?.color ?? "#888") : "#fff",
                        color: form.type === t ? "white" : "#555",
                        cursor: "pointer",
                      }}
                    >
                      {typeConfig[t]?.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Équipement *</label>
                <select className="form-control" value={form.assetId} onChange={e => setForm(p => ({ ...p, assetId: e.target.value }))} required>
                  <option value="">— Sélectionner —</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>)}
                </select>
              </div>
              {(form.type === "SORTIE" || form.type === "TRANSFERT") && (
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Depuis (local de départ)</label>
                  <select className="form-control" value={form.fromLocationId} onChange={e => setForm(p => ({ ...p, fromLocationId: e.target.value }))}>
                    <option value="">— Sélectionner —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              {(form.type === "ENTREE" || form.type === "TRANSFERT") && (
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Vers (destination)</label>
                  <select className="form-control" value={form.toLocationId} onChange={e => setForm(p => ({ ...p, toLocationId: e.target.value }))}>
                    <option value="">— Sélectionner —</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Quantité</label>
                  <input type="number" min="1" className="form-control" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Référence (bon)</label>
                  <input className="form-control" placeholder="ex: BL-2024-001" value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Note</label>
                <textarea className="form-control" rows={2} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-default" disabled={loading}>Annuler</button>
                <button type="submit" disabled={loading || !form.assetId} style={{ padding: "8px 22px", background: "#00a65a", color: "white", border: "none", borderRadius: 4, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

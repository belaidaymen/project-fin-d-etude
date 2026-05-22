"use client";

import { useState } from "react";
import { Plus, X, FileText } from "lucide-react";

interface Demande {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  urgency: string;
  status: string;
  createdAt: string;
  reviewNote: string | null;
  reviewer: { firstName: string; lastName: string } | null;
  reviewedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE: { label: "En attente", color: "#f39c12", bg: "#fef6e6" },
  APPROUVEE: { label: "Approuvée", color: "#00a65a", bg: "#e6f9f0" },
  REJETEE: { label: "Rejetée", color: "#d9534f", bg: "#fde8e8" },
};

const urgenceOptions = [
  { value: "HAUTE", label: "Haute", color: "#d9534f" },
  { value: "NORMALE", label: "Normale", color: "#f39c12" },
  { value: "BASSE", label: "Basse", color: "#777" },
];

export default function DemandesLabClient({ demandes: initial, laboratoireId }: { demandes: Demande[]; laboratoireId: string }) {
  const [demandes, setDemandes] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", quantity: "1", urgency: "NORMALE" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          laboratoireId,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setDemandes(prev => [saved, ...prev]);
        setShowForm(false);
        setForm({ title: "", description: "", quantity: "1", urgency: "NORMALE" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Mes Demandes d'Équipements</h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>
            Formuler et suivre vos demandes d'achat ou de remplacement
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#f39c12", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          <Plus size={15} /> Nouvelle demande
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(statusConfig).map(([key, sc]) => {
          const count = demandes.filter(d => d.status === key).length;
          return (
            <div key={key} style={{ padding: "8px 16px", background: sc.bg, borderRadius: 6, border: `1px solid ${sc.color}30` }}>
              <span style={{ fontSize: 12, color: sc.color, fontWeight: 600 }}>{sc.label}: {count}</span>
            </div>
          );
        })}
      </div>

      {demandes.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 8, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
          <FileText size={48} style={{ color: "#ddd", marginBottom: 16 }} />
          <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>Vous n'avez formulé aucune demande.</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
            Formuler une demande
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demandes.map(d => {
            const sc = statusConfig[d.status] ?? statusConfig.EN_ATTENTE;
            const uc = urgenceOptions.find(u => u.value === d.urgency);
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.08)", borderLeft: `4px solid ${sc.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{d.title}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      {uc && (
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: uc.color + "18", color: uc.color }}>
                          Urgence: {uc.label}
                        </span>
                      )}
                    </div>
                    {d.description && <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13, lineHeight: 1.5 }}>{d.description}</p>}
                    <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>Quantité: <b>{d.quantity}</b></span>
                      <span>Soumise le: <b>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</b></span>
                    </div>
                    {d.reviewNote && (
                      <div style={{ marginTop: 10, padding: "10px 14px", background: sc.bg, borderRadius: 4, fontSize: 12 }}>
                        <b style={{ color: sc.color }}>Réponse:</b>{" "}
                        <span style={{ color: "#555" }}>{d.reviewNote}</span>
                        {d.reviewer && (
                          <span style={{ color: "#aaa" }}> — {d.reviewer.firstName} {d.reviewer.lastName}</span>
                        )}
                        {d.reviewedAt && (
                          <span style={{ color: "#aaa" }}> ({new Date(d.reviewedAt).toLocaleDateString("fr-FR")})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New request modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#333" }}>Nouvelle demande d'équipement</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Titre de la demande *</label>
                <input className="form-control" placeholder="Ex: Achat de 3 ordinateurs HP..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Description / justification</label>
                <textarea className="form-control" rows={3} placeholder="Décrivez le besoin et justifiez la demande..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Quantité</label>
                  <input type="number" min="1" className="form-control" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Urgence</label>
                  <select className="form-control" value={form.urgency} onChange={e => setForm(p => ({ ...p, urgency: e.target.value }))}>
                    {urgenceOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-default" disabled={loading}>Annuler</button>
                <button type="submit" disabled={loading || !form.title} style={{ padding: "8px 22px", background: "#f39c12", color: "white", border: "none", borderRadius: 4, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Envoi..." : "Soumettre la demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

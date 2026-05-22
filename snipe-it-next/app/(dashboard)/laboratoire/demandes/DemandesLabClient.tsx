"use client";

import { useState } from "react";
import { Plus, X, FileText, ShoppingCart, RefreshCw, Archive } from "lucide-react";

interface Demande {
  id: string;
  title: string;
  description: string | null;
  type: string;
  quantity: number;
  urgency: string;
  status: string;
  createdAt: string;
  reviewNote: string | null;
  reviewer: { firstName: string; lastName: string } | null;
  reviewedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE: { label: "En attente de validation", color: "#f39c12", bg: "#fef6e6" },
  APPROUVEE: { label: "Approuvée", color: "#00a65a", bg: "#e6f9f0" },
  REJETEE: { label: "Rejetée", color: "#d9534f", bg: "#fde8e8" },
};

const typeConfig: Record<string, { label: string; color: string; bg: string; description: string; icon: React.ReactNode }> = {
  ACHAT: {
    label: "Achat",
    color: "#3c8dbc",
    bg: "#e8f4fb",
    description: "Acquisition de nouvel équipement",
    icon: <ShoppingCart size={16} />,
  },
  REMPLACEMENT: {
    label: "Remplacement",
    color: "#e67e22",
    bg: "#fef0e6",
    description: "Remplacement d'un équipement existant",
    icon: <RefreshCw size={16} />,
  },
  REFORME: {
    label: "Réforme",
    color: "#8e44ad",
    bg: "#f5eef8",
    description: "Mise en réforme d'un équipement hors service",
    icon: <Archive size={16} />,
  },
};

const urgenceOptions = [
  { value: "HAUTE", label: "Haute — Bloque les activités", color: "#d9534f" },
  { value: "NORMALE", label: "Normale", color: "#f39c12" },
  { value: "BASSE", label: "Basse — Non urgent", color: "#777" },
];

export default function DemandesLabClient({ demandes: initial, laboratoireId }: { demandes: Demande[]; laboratoireId: string }) {
  const [demandes, setDemandes] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "ACHAT", quantity: "1", urgency: "NORMALE" });

  const byType = {
    ACHAT: demandes.filter(d => d.type === "ACHAT").length,
    REMPLACEMENT: demandes.filter(d => d.type === "REMPLACEMENT").length,
    REFORME: demandes.filter(d => d.type === "REFORME").length,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity), laboratoireId }),
      });
      if (res.ok) {
        const saved = await res.json();
        setDemandes(prev => [saved, ...prev]);
        setShowForm(false);
        setForm({ title: "", description: "", type: "ACHAT", quantity: "1", urgency: "NORMALE" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Mes Demandes d'Équipements</h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>
            Formuler des demandes d'achat, de remplacement ou de réforme et suivre leur validation
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#f39c12", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
        >
          <Plus size={15} /> Nouvelle demande
        </button>
      </div>

      {/* Type summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {Object.entries(typeConfig).map(([key, tc]) => (
          <div key={key} style={{ background: "#fff", borderRadius: 8, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.08)", borderLeft: `4px solid ${tc.color}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: tc.color }}>{tc.icon}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: tc.color }}>{byType[key as keyof typeof byType]}</div>
              <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>Demande{byType[key as keyof typeof byType] !== 1 ? "s" : ""} de {tc.label.toLowerCase()}</div>
            </div>
          </div>
        ))}
      </div>

      {demandes.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 8, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
          <FileText size={48} style={{ color: "#ddd", marginBottom: 16 }} />
          <p style={{ color: "#aaa", fontSize: 14, margin: 0 }}>Vous n'avez formulé aucune demande.</p>
          <button onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>
            Formuler ma première demande
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {demandes.map(d => {
            const sc = statusConfig[d.status] ?? statusConfig.EN_ATTENTE;
            const tc = typeConfig[d.type] ?? typeConfig.ACHAT;
            const uc = urgenceOptions.find(u => u.value === d.urgency);
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 8, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,.08)", borderLeft: `4px solid ${tc.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.color }}>
                        {tc.icon} {tc.label.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{d.title}</span>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      {uc && (
                        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: uc.color + "18", color: uc.color }}>
                          Urgence: {uc.label.split(" — ")[0]}
                        </span>
                      )}
                    </div>
                    {d.description && <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13, lineHeight: 1.5 }}>{d.description}</p>}
                    <div style={{ fontSize: 12, color: "#888", display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span>Quantité: <b>{d.quantity}</b></span>
                      <span>Soumise le: <b>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</b></span>
                    </div>
                    {d.reviewNote && (
                      <div style={{ marginTop: 10, padding: "10px 14px", background: sc.bg, borderRadius: 4, fontSize: 12, borderLeft: `3px solid ${sc.color}` }}>
                        <b style={{ color: sc.color }}>Réponse du responsable logistique:</b>{" "}
                        <span style={{ color: "#555" }}>{d.reviewNote}</span>
                        {d.reviewer && <span style={{ color: "#aaa" }}> — {d.reviewer.firstName} {d.reviewer.lastName}</span>}
                        {d.reviewedAt && <span style={{ color: "#aaa" }}> ({new Date(d.reviewedAt).toLocaleDateString("fr-FR")})</span>}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: "100%", maxWidth: 540, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#333" }}>Nouvelle demande d'équipement</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              {/* Type selector */}
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 8, display: "block" }}>Type de demande *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {Object.entries(typeConfig).map(([key, tc]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, type: key }))}
                      style={{
                        padding: "10px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                        border: form.type === key ? `2px solid ${tc.color}` : "2px solid #e9ecef",
                        background: form.type === key ? tc.bg : "#fafafa",
                        color: form.type === key ? tc.color : "#888",
                        cursor: "pointer", textAlign: "center",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      }}
                    >
                      <span style={{ color: form.type === key ? tc.color : "#bbb" }}>{tc.icon}</span>
                      <span>{tc.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 400, color: "#aaa", lineHeight: 1.2 }}>{tc.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Titre de la demande *</label>
                <input
                  className="form-control"
                  placeholder={
                    form.type === "ACHAT" ? "Ex: Achat de 3 ordinateurs HP ProBook..." :
                    form.type === "REMPLACEMENT" ? "Ex: Remplacement du projecteur hors service..." :
                    "Ex: Réforme de l'oscilloscope EQ-012..."
                  }
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>Description / justification</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Décrivez le besoin, justifiez la demande, mentionnez l'équipement concerné le cas échéant..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
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
                <button type="submit" disabled={loading || !form.title} style={{
                  padding: "8px 22px", background: typeConfig[form.type]?.color ?? "#f39c12",
                  color: "white", border: "none", borderRadius: 4, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}>
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

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface Demande {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  urgency: string;
  status: string;
  createdAt: string;
  laboratoire: { name: string } | null;
  requester: { firstName: string; lastName: string };
  reviewer: { firstName: string; lastName: string } | null;
  reviewNote: string | null;
  reviewedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE: { label: "En attente", color: "#f39c12", bg: "#fef6e6" },
  APPROUVEE: { label: "Approuvée", color: "#00a65a", bg: "#e6f9f0" },
  REJETEE: { label: "Rejetée", color: "#d9534f", bg: "#fde8e8" },
};
const urgenceConfig: Record<string, { label: string; color: string }> = {
  HAUTE: { label: "Haute", color: "#d9534f" },
  NORMALE: { label: "Normale", color: "#f39c12" },
  BASSE: { label: "Basse", color: "#777" },
};

export default function DemandesClient({ demandes: initial }: { demandes: Demande[] }) {
  const [demandes, setDemandes] = useState(initial);
  const [modal, setModal] = useState<{ id: string; action: "APPROUVEE" | "REJETEE" } | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = filterStatus === "ALL" ? demandes : demandes.filter(d => d.status === filterStatus);

  async function handleReview() {
    if (!modal) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/demandes/${modal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modal.action, reviewNote: note }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDemandes(prev => prev.map(d => d.id === modal.id ? { ...d, ...updated } : d));
        setModal(null);
        setNote("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#333" }}>Gestion des Demandes</h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 14 }}>
            Valider ou rejeter les demandes d'équipements des laboratoires
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["ALL", "EN_ATTENTE", "APPROUVEE", "REJETEE"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                border: filterStatus === s ? "none" : "1px solid #e0e0e0",
                background: filterStatus === s ? "#3c8dbc" : "#fff",
                color: filterStatus === s ? "white" : "#555",
                cursor: "pointer",
              }}
            >
              {s === "ALL" ? "Toutes" : statusConfig[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 8, padding: 40, textAlign: "center", color: "#aaa", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
            Aucune demande trouvée
          </div>
        ) : filtered.map(d => {
          const sc = statusConfig[d.status] ?? statusConfig.EN_ATTENTE;
          const uc = urgenceConfig[d.urgency] ?? urgenceConfig.NORMALE;
          return (
            <div key={d.id} style={{
              background: "#fff", borderRadius: 8, padding: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
              borderLeft: `4px solid ${sc.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{d.title}</span>
                    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: uc.color + "18", color: uc.color }}>
                      Urgence: {uc.label}
                    </span>
                  </div>
                  {d.description && (
                    <p style={{ margin: "0 0 8px", color: "#666", fontSize: 13, lineHeight: 1.5 }}>{d.description}</p>
                  )}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#888" }}>
                    <span><b>Laboratoire:</b> {d.laboratoire?.name ?? "—"}</span>
                    <span><b>Demandeur:</b> {d.requester.firstName} {d.requester.lastName}</span>
                    <span><b>Quantité:</b> {d.quantity}</span>
                    <span><b>Date:</b> {new Date(d.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {d.reviewNote && (
                    <div style={{ marginTop: 8, padding: "8px 12px", background: "#f8f9fa", borderRadius: 4, fontSize: 12, color: "#555" }}>
                      <b>Note:</b> {d.reviewNote}
                      {d.reviewer && <span style={{ color: "#aaa" }}> — {d.reviewer.firstName} {d.reviewer.lastName}</span>}
                    </div>
                  )}
                </div>
                {d.status === "EN_ATTENTE" && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setModal({ id: d.id, action: "APPROUVEE" })}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                        background: "#00a65a", color: "white", border: "none",
                        borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={14} /> Approuver
                    </button>
                    <button
                      onClick={() => setModal({ id: d.id, action: "REJETEE" })}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                        background: "#d9534f", color: "white", border: "none",
                        borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <XCircle size={14} /> Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 28, width: 460, boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#333" }}>
              {modal.action === "APPROUVEE" ? "✅ Approuver la demande" : "❌ Rejeter la demande"}
            </h3>
            <p style={{ margin: "0 0 16px", color: "#666", fontSize: 13 }}>
              Ajoutez une note explicative (optionnel pour approbation, recommandé pour rejet).
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note de révision..."
              className="form-control"
              rows={3}
              style={{ marginBottom: 16, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setModal(null); setNote(""); }} className="btn btn-default" disabled={loading}>
                Annuler
              </button>
              <button
                onClick={handleReview}
                disabled={loading}
                style={{
                  padding: "8px 20px", border: "none", borderRadius: 4,
                  background: modal.action === "APPROUVEE" ? "#00a65a" : "#d9534f",
                  color: "white", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "En cours..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

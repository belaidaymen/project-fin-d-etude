"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DemandeActions({ demandeId }: { demandeId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleAction(statut: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut, notes }) });
      if (res.ok) router.refresh();
    } finally { setLoading(false); }
  }

  return (
    <div className="box box-warning">
      <div className="box-header with-border"><h3 className="box-title">Traiter la demande</h3></div>
      <div className="box-body">
        <div className="form-group">
          <label style={{ fontSize: 13 }}>Notes de décision</label>
          <textarea className="form-control" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Commentaires sur la décision..." />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleAction("APPROUVEE")} className="btn btn-success btn-sm" disabled={loading} style={{ flex: 1 }}>
            ✓ Approuver
          </button>
          <button onClick={() => handleAction("REJETEE")} className="btn btn-danger btn-sm" disabled={loading} style={{ flex: 1 }}>
            ✗ Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}

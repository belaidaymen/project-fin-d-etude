"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface Settings {
  id: number;
  siteName: string;
}

export default function SettingsClient({ settings }: { settings: Settings }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {success && <div className="alert alert-success">Paramètres enregistrés avec succès !</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="box box-primary">
        <div className="box-header with-border"><h3 className="box-title">Paramètres généraux</h3></div>
        <div className="box-body">
          <div className="form-group" style={{ maxWidth: 400 }}>
            <label>Nom du site</label>
            <input
              className="form-control"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="GestActif"
              required
            />
            <p className="help-block">Nom affiché dans l'interface et les en-têtes.</p>
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={14} /> {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="box box-default">
        <div className="box-header with-border"><h3 className="box-title">Informations système</h3></div>
        <div className="box-body">
          <table className="table" style={{ maxWidth: 400 }}>
            <tbody>
              <tr><td style={{ fontWeight: 600, color: "#777", width: "40%" }}>Application</td><td>GestActif v1.0</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#777" }}>Framework</td><td>Next.js 16 (App Router)</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#777" }}>Base de données</td><td>PostgreSQL via Prisma</td></tr>
              <tr><td style={{ fontWeight: 600, color: "#777" }}>Institution</td><td>Université</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ParametresPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ siteName: "", siteSubtitle: "", primaryColor: "#3c8dbc", currency: "DZD", timezone: "Africa/Algiers", adminEmail: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN";

  useEffect(() => {
    fetch("/api/parametres").then(r => r.json()).then(s => {
      setForm({ siteName: s.siteName ?? "", siteSubtitle: s.siteSubtitle ?? "", primaryColor: s.primaryColor ?? "#3c8dbc", currency: s.currency ?? "DZD", timezone: s.timezone ?? "Africa/Algiers", adminEmail: s.adminEmail ?? "" });
      setFetching(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setMessage(""); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/parametres", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Paramètres enregistrés avec succès.");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  if (fetching) return <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>;

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Paramètres <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Configuration du système</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Paramètres</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Paramètres généraux</h3></div>
          <div className="box-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!canEdit && <div className="alert alert-info">Seul l'administrateur peut modifier ces paramètres.</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group">
                  <label>Nom du site</label>
                  <input name="siteName" className="form-control" value={form.siteName} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="form-group">
                  <label>Sous-titre</label>
                  <input name="siteSubtitle" className="form-control" value={form.siteSubtitle} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="form-group">
                  <label>Couleur principale</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} disabled={!canEdit} style={{ width: 50, height: 38, padding: 2, border: "1px solid #ddd", borderRadius: 4 }} />
                    <input name="primaryColor" className="form-control" value={form.primaryColor} onChange={handleChange} disabled={!canEdit} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Devise</label>
                  <select name="currency" className="form-control" value={form.currency} onChange={handleChange} disabled={!canEdit}>
                    <option value="DZD">DZD — Dinar Algérien</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — Dollar US</option>
                    <option value="MAD">MAD — Dirham Marocain</option>
                    <option value="TND">TND — Dinar Tunisien</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuseau horaire</label>
                  <select name="timezone" className="form-control" value={form.timezone} onChange={handleChange} disabled={!canEdit}>
                    <option value="Africa/Algiers">Africa/Algiers (GMT+1)</option>
                    <option value="Africa/Tunis">Africa/Tunis (GMT+1)</option>
                    <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1/+2)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Email administrateur</label>
                  <input name="adminEmail" type="email" className="form-control" value={form.adminEmail} onChange={handleChange} disabled={!canEdit} />
                </div>
              </div>
              {canEdit && (
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer les paramètres"}</button>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

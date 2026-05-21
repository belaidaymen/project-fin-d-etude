"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = { ADMIN: "Administrateur", LOGISTICIEN: "Resp. Logistique", MAGASINIER: "Magasinier", CHEF_LABO: "Resp. Laboratoire" };
const ROLE_COLORS: Record<string, string> = { ADMIN: "#dd4b39", LOGISTICIEN: "#3c8dbc", MAGASINIER: "#00a65a", CHEF_LABO: "#f39c12" };

export default function ProfilPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault(); setMessage(""); setError(""); setLoading(true);
    if (form.newPassword !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas."); setLoading(false); return; }
    if (form.newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); setLoading(false); return; }
    try {
      const res = await fetch(`/api/utilisateurs/${user?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.newPassword }) });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Mot de passe modifié avec succès.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  if (!session) return null;

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Mon profil</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Profil</li></ol>
      </section>
      <section className="content">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="box box-primary">
            <div className="box-header with-border"><h3 className="box-title">Informations du compte</h3></div>
            <div className="box-body">
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: ROLE_COLORS[user?.role] ?? "#3c8dbc", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 700 }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{user?.name}</div>
                  <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 10, background: (ROLE_COLORS[user?.role] ?? "#ccc") + "22", color: ROLE_COLORS[user?.role] ?? "#333", fontWeight: 600 }}>
                    {ROLE_LABELS[user?.role] ?? user?.role}
                  </span>
                </div>
              </div>
              <table className="table table-condensed" style={{ margin: 0 }}>
                <tbody>
                  <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13, width: "40%", padding: "8px 0" }}>Identifiant</td><td style={{ fontFamily: "monospace", fontSize: 13, padding: "8px 0" }}>{user?.username}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13, padding: "8px 0" }}>Email</td><td style={{ fontSize: 13, padding: "8px 0" }}>{user?.email}</td></tr>
                  <tr><td style={{ fontWeight: 600, color: "#777", fontSize: 13, padding: "8px 0" }}>Rôle</td><td style={{ fontSize: 13, padding: "8px 0" }}>{ROLE_LABELS[user?.role] ?? user?.role}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Changer le mot de passe</h3></div>
            <div className="box-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handlePasswordChange}>
                <div className="form-group"><label>Nouveau mot de passe *</label><input name="newPassword" type="password" className="form-control" value={form.newPassword} onChange={handleChange} required minLength={8} /></div>
                <div className="form-group"><label>Confirmer le mot de passe *</label><input name="confirmPassword" type="password" className="form-control" value={form.confirmPassword} onChange={handleChange} required /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Modification..." : "Changer le mot de passe"}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

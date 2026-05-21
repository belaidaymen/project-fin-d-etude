"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "", nom: "", username: "admin",
    email: "", password: "", siteName: "GestActifs",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la configuration");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div style={{ width: 480 }}>
        <div className="login-logo">
          <a href="#"><b>Gest</b>Actifs</a>
        </div>
        <div className="login-box-body">
          <p className="login-box-msg" style={{ fontSize: 16, marginBottom: 8 }}>Configuration initiale</p>
          <p style={{ color: "#777", fontSize: 13, textAlign: "center", marginBottom: 20 }}>
            Créez votre compte administrateur pour commencer
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Prénom *</label>
                <input name="prenom" className="form-control" value={form.prenom} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nom *</label>
                <input name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Identifiant *</label>
              <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Adresse e-mail *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Mot de passe *</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <div className="form-group">
              <label>Nom du site</label>
              <input name="siteName" className="form-control" value={form.siteName} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Configuration en cours..." : "Créer le compte administrateur"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Identifiant ou mot de passe incorrect.");
    } else {
      router.push("/dashboard");
    }
  }

  const demoAccounts = [
    { role: "Responsable Logistique", username: "logistique", password: "logistique123", color: "#3c8dbc" },
    { role: "Magasinier", username: "magasinier", password: "magasinier123", color: "#00a65a" },
    { role: "Responsable Laboratoire", username: "labo1", password: "labo123", color: "#f39c12" },
  ];

  return (
    <div className="login-page">
      <div style={{ width: 420 }}>
        <div className="login-logo">
          <a href="#" style={{ color: "#3c8dbc", textDecoration: "none", fontSize: 28, fontWeight: 300 }}>
            <b style={{ fontWeight: 700 }}>Gest</b>Actif
          </a>
          <div style={{ fontSize: 13, color: "#777", marginTop: 4, fontWeight: 400 }}>
            Gestion des Actifs Universitaires
          </div>
        </div>

        <div className="login-box-body">
          <p className="login-box-msg">Connectez-vous pour accéder à votre espace</p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 15 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#999" }}>
                <User size={15} />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                style={{ paddingLeft: 32 }}
              />
            </div>
            <div className="form-group" style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#999" }}>
                <Lock size={15} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingLeft: 32, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0,
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : "Se connecter"}
            </button>
          </form>
        </div>

        <div style={{
          background: "#fff", borderRadius: 6, padding: 16, marginTop: 20,
          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
        }}>
          <p style={{ fontSize: 12, color: "#777", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Comptes de démonstration
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {demoAccounts.map(acc => (
              <button
                key={acc.username}
                type="button"
                onClick={() => { setUsername(acc.username); setPassword(acc.password); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", background: "#f8f9fa",
                  border: "1px solid #e9ecef", borderRadius: 4,
                  cursor: "pointer", textAlign: "left", transition: "background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#e9ecef")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f8f9fa")}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: acc.color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{acc.role}</div>
                  <div style={{ fontSize: 11, color: "#777" }}>
                    {acc.username} / {acc.password}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#aaa" }}>Cliquer pour remplir</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

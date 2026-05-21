"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

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

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <a href="#"><b>Gest</b>Actifs</a>
        </div>
        <div className="login-box-body">
          <p className="login-box-msg">Connectez-vous pour accéder à votre session</p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 15 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Identifiant ou e-mail"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                className="form-control"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 36 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : "Se connecter"}
            </button>
          </form>

          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 6, fontSize: 12, color: "#777" }}>
            <strong style={{ display: "block", marginBottom: 6, color: "#555" }}>Comptes de démonstration :</strong>
            <div>admin / admin123 — Administrateur</div>
            <div>logisticien / password123 — Resp. Logistique</div>
            <div>magasinier / password123 — Magasinier</div>
            <div>cheflabo / password123 — Resp. Laboratoire</div>
          </div>
        </div>
      </div>
    </div>
  );
}

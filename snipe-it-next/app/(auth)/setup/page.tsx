"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "admin",
    email: "", password: "", siteName: "Snipe-IT",
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
      if (!res.ok) throw new Error(data.error || "Setup failed");
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
          <a href="#"><b>Snipe</b>-IT</a>
        </div>
        <div className="login-box-body">
          <p className="login-box-msg" style={{ fontSize: 16, marginBottom: 10 }}>
            Initial Setup
          </p>
          <p style={{ color: "#777", fontSize: 13, textAlign: "center", marginBottom: 20 }}>
            Create your administrator account to get started
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>First Name *</label>
                <input name="firstName" className="form-control" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Last Name *</label>
                <input name="lastName" className="form-control" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <div className="form-group">
              <label>Site Name</label>
              <input name="siteName" className="form-control" value={form.siteName} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Setting up..." : "Create Admin Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

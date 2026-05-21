"use client";

import { useState } from "react";
import { Save } from "lucide-react";

interface Settings {
  id: number;
  siteName: string;
  headerColor: string;
  currency: string;
  perPage: number;
  dateDisplayFormat: string;
  defaultLocale: string;
  defaultTimezone: string;
  loginNote: string | null;
  adminCc: string | null;
  alertEmail: string | null;
  alertQty: number;
  dashboardMessage: string | null;
}

export default function SettingsClient({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({ ...settings, loginNote: settings.loginNote ?? "", adminCc: settings.adminCc ?? "", alertEmail: settings.alertEmail ?? "", dashboardMessage: settings.dashboardMessage ?? "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "perPage" || name === "alertQty" ? parseInt(value) || 0 : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);
    try {
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  const TIMEZONES = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney"];
  const LOCALES = ["en-US", "en-GB", "fr-FR", "de-DE", "es-ES", "pt-BR", "ja-JP", "zh-CN"];
  const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "D MMMM YYYY"];

  return (
    <form onSubmit={handleSubmit}>
      {success && <div className="alert alert-success">Settings saved successfully!</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {/* General */}
        <div className="box box-primary" style={{ gridColumn: "1 / -1" }}>
          <div className="box-header with-border"><h3 className="box-title">General Settings</h3></div>
          <div className="box-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
              <div className="form-group">
                <label>Site Name</label>
                <input name="siteName" className="form-control" value={form.siteName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Header Color</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="color" value={form.headerColor} onChange={e => setForm(prev => ({ ...prev, headerColor: e.target.value }))} style={{ width: 50, height: 36, padding: 2, border: "1px solid #d2d6de", borderRadius: 4, cursor: "pointer" }} />
                  <input name="headerColor" className="form-control" value={form.headerColor} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select name="currency" className="form-control" value={form.currency} onChange={handleChange}>
                  {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CNY", "INR"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Items Per Page</label>
                <input name="perPage" type="number" min="5" max="200" className="form-control" value={form.perPage} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Date Format</label>
                <select name="dateDisplayFormat" className="form-control" value={form.dateDisplayFormat} onChange={handleChange}>
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Locale</label>
                <select name="defaultLocale" className="form-control" value={form.defaultLocale} onChange={handleChange}>
                  {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select name="defaultTimezone" className="form-control" value={form.defaultTimezone} onChange={handleChange}>
                  {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Alert Email</label>
                <input name="alertEmail" type="email" className="form-control" value={form.alertEmail} onChange={handleChange} placeholder="alerts@example.com" />
              </div>
              <div className="form-group">
                <label>Alert Qty Threshold</label>
                <input name="alertQty" type="number" min="0" className="form-control" value={form.alertQty} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Login Page Message</label>
              <textarea name="loginNote" className="form-control" value={form.loginNote} onChange={handleChange} rows={2} placeholder="Message shown on the login page..." />
            </div>
            <div className="form-group">
              <label>Dashboard Message</label>
              <textarea name="dashboardMessage" className="form-control" value={form.dashboardMessage} onChange={handleChange} rows={2} />
            </div>
          </div>
          <div className="box-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save Settings"}</button>
          </div>
        </div>
      </div>
    </form>
  );
}

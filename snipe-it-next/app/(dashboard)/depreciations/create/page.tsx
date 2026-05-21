"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

export default function CreateDepreciationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", months: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/depreciations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/depreciations");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1>Create Depreciation</h1>
        <ol className="breadcrumb"><li><Link href="/depreciations">Depreciations</Link></li><li className="active">Create</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary" style={{ maxWidth: 500 }}>
          <div className="box-header with-border"><h3 className="box-title">Depreciation Details</h3></div>
          <form onSubmit={handleSubmit}>
            <div className="box-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label>Name *</label>
                <input name="name" className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Term (months) *</label>
                <input name="months" type="number" min="1" className="form-control" value={form.months} onChange={e => setForm(p => ({ ...p, months: e.target.value }))} required placeholder="e.g. 36" />
                <small style={{ color: "#777" }}>Standard depreciation periods: 36 months (3 yr), 48 months (4 yr), 60 months (5 yr)</small>
              </div>
            </div>
            <div className="box-footer">
              <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
              <Link href="/depreciations" className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

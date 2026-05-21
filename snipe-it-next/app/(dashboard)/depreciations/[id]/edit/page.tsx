"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

export default function EditDepreciationPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ name: "", months: "" });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/depreciations/${params.id}`)
      .then(r => r.json())
      .then(data => { setForm({ name: data.name ?? "", months: data.months?.toString() ?? "" }); setFetching(false); });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/depreciations/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/depreciations");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  if (fetching) return <section className="content"><div className="spinner" /></section>;

  return (
    <>
      <section className="content-header">
        <h1>Edit Depreciation</h1>
        <ol className="breadcrumb"><li><Link href="/depreciations">Depreciations</Link></li><li className="active">Edit</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary" style={{ maxWidth: 500 }}>
          <div className="box-header with-border"><h3 className="box-title">Edit Depreciation</h3></div>
          <form onSubmit={handleSubmit}>
            <div className="box-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label>Name *</label><input name="name" className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label>Term (months) *</label><input name="months" type="number" min="1" className="form-control" value={form.months} onChange={e => setForm(p => ({ ...p, months: e.target.value }))} required /></div>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", fax: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push("/companies");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1>Create Company</h1>
        <ol className="breadcrumb"><li><Link href="/companies">Companies</Link></li><li className="active">Create</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary" style={{ maxWidth: 700 }}>
          <div className="box-header with-border"><h3 className="box-title">Company Information</h3></div>
          <form onSubmit={handleSubmit}>
            <div className="box-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group"><label>Name *</label><input name="name" className="form-control" value={form.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Phone</label><input name="phone" className="form-control" value={form.phone} onChange={handleChange} /></div>
              <div className="form-group"><label>Fax</label><input name="fax" className="form-control" value={form.fax} onChange={handleChange} /></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} /></div>
              <div className="form-group"><label>Notes</label><textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} /></div>
            </div>
            <div className="box-footer">
              <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
              <Link href="/companies" className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

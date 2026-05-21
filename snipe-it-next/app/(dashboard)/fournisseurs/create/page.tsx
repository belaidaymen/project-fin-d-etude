"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateFournisseurPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", contact: "", email: "", telephone: "", adresse: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/fournisseurs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/fournisseurs");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouveau fournisseur</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/fournisseurs">Fournisseurs</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Informations du fournisseur</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Nom *</label><input name="nom" className="form-control" value={form.nom} onChange={handleChange} required /></div>
                <div className="form-group"><label>Personne de contact</label><input name="contact" className="form-control" value={form.contact} onChange={handleChange} /></div>
                <div className="form-group"><label>Téléphone</label><input name="telephone" className="form-control" value={form.telephone} onChange={handleChange} /></div>
                <div className="form-group"><label>Email</label><input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} /></div>
                <div className="form-group"><label>Adresse</label><input name="adresse" className="form-control" value={form.adresse} onChange={handleChange} /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
                <Link href="/fournisseurs" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

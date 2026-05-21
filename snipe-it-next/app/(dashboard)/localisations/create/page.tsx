"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "SALLE", label: "Salle de cours" },
  { value: "LABORATOIRE", label: "Laboratoire" },
  { value: "SERVICE", label: "Service / Bureau" },
  { value: "ENTREPOT", label: "Entrepôt / Stock" },
];

export default function CreateLocalisationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", type: "SALLE", batiment: "", etage: "", capacite: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/localisations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/localisations/${data.id}`);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvelle localisation</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/localisations">Localisations</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Informations de la localisation</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Nom *</label><input name="nom" className="form-control" value={form.nom} onChange={handleChange} required placeholder="ex: Salle A101" /></div>
                <div className="form-group"><label>Type *</label>
                  <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Bâtiment</label><input name="batiment" className="form-control" value={form.batiment} onChange={handleChange} placeholder="ex: Bloc A" /></div>
                <div className="form-group"><label>Étage</label><input name="etage" className="form-control" value={form.etage} onChange={handleChange} placeholder="ex: 1er étage, RDC" /></div>
                <div className="form-group"><label>Capacité (personnes)</label><input name="capacite" type="number" min="1" className="form-control" value={form.capacite} onChange={handleChange} /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
                <Link href="/localisations" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

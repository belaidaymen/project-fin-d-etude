"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "SALLE", label: "Salle de cours" }, { value: "LABORATOIRE", label: "Laboratoire" },
  { value: "SERVICE", label: "Service / Bureau" }, { value: "ENTREPOT", label: "Entrepôt / Stock" },
];

export default function EditLocalisationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/localisations/${params.id}`).then(r => r.json()).then(item => {
      setForm({ nom: item.nom, type: item.type, batiment: item.batiment ?? "", etage: item.etage ?? "", capacite: item.capacite ?? "", description: item.description ?? "", actif: item.actif });
    });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/localisations/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/localisations/${params.id}`);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  if (!form) return <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>;

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Modifier la localisation</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/localisations">Localisations</Link></li><li className="active">Modifier</li></ol>
      </section>
      <section className="content">
        <div className="box box-warning">
          <div className="box-header with-border"><h3 className="box-title">Modifier les informations</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Nom *</label><input name="nom" className="form-control" value={form.nom} onChange={handleChange} required /></div>
                <div className="form-group"><label>Type</label><select name="type" className="form-control" value={form.type} onChange={handleChange}>{TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div className="form-group"><label>Bâtiment</label><input name="batiment" className="form-control" value={form.batiment} onChange={handleChange} /></div>
                <div className="form-group"><label>Étage</label><input name="etage" className="form-control" value={form.etage} onChange={handleChange} /></div>
                <div className="form-group"><label>Capacité</label><input name="capacite" type="number" className="form-control" value={form.capacite} onChange={handleChange} /></div>
                <div className="form-group"><label>Statut</label>
                  <select name="actif" className="form-control" value={form.actif ? "true" : "false"} onChange={e => setForm((p: any) => ({ ...p, actif: e.target.value === "true" }))}>
                    <option value="true">Active</option><option value="false">Inactive</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-warning" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
                <Link href={`/localisations/${params.id}`} className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

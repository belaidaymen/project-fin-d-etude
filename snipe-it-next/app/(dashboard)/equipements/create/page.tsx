"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ETAT_OPTIONS = [
  { value: "BON", label: "Bon" }, { value: "MOYEN", label: "Moyen" },
  { value: "MAUVAIS", label: "Mauvais" }, { value: "HORS_SERVICE", label: "Hors service" },
  { value: "EN_MAINTENANCE", label: "En maintenance" }, { value: "REFORME", label: "Réformé" },
];

export default function CreateEquipementPage() {
  const router = useRouter();
  const [form, setForm] = useState({ reference: "", nom: "", description: "", categorieId: "", marque: "", modele: "", numeroSerie: "", etat: "BON", dateAcquisition: "", prixAcquisition: "", fournisseurId: "", quantite: "1", notes: "" });
  const [categories, setCategories] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    fetch("/api/fournisseurs").then(r => r.json()).then(setFournisseurs);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/equipements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/equipements/${data.id}`);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvel équipement</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/equipements">Équipements</Link></li>
          <li className="active">Créer</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Fiche équipement</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group">
                  <label>Référence *</label>
                  <input name="reference" className="form-control" value={form.reference} onChange={handleChange} required placeholder="ex: PC-001" />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input name="nom" className="form-control" value={form.nom} onChange={handleChange} required placeholder="ex: PC Bureau HP" />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select name="categorieId" className="form-control" value={form.categorieId} onChange={handleChange} required>
                    <option value="">-- Sélectionner --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>État</label>
                  <select name="etat" className="form-control" value={form.etat} onChange={handleChange}>
                    {ETAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marque</label>
                  <input name="marque" className="form-control" value={form.marque} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Modèle</label>
                  <input name="modele" className="form-control" value={form.modele} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Numéro de série</label>
                  <input name="numeroSerie" className="form-control" value={form.numeroSerie} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Quantité</label>
                  <input name="quantite" type="number" min="1" className="form-control" value={form.quantite} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Date d'acquisition</label>
                  <input name="dateAcquisition" type="date" className="form-control" value={form.dateAcquisition} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Prix d'acquisition (DZD)</label>
                  <input name="prixAcquisition" type="number" step="0.01" className="form-control" value={form.prixAcquisition} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Fournisseur</label>
                  <select name="fournisseurId" className="form-control" value={form.fournisseurId} onChange={handleChange}>
                    <option value="">-- Aucun --</option>
                    {fournisseurs.map((f: any) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Description</label>
                  <textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Notes</label>
                  <textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
                <Link href="/equipements" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

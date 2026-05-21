"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ETAT_OPTIONS = [
  { value: "BON", label: "Bon" }, { value: "MOYEN", label: "Moyen" },
  { value: "MAUVAIS", label: "Mauvais" }, { value: "HORS_SERVICE", label: "Hors service" },
  { value: "EN_MAINTENANCE", label: "En maintenance" }, { value: "REFORME", label: "Réformé" },
];

export default function EditEquipementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/equipements/${params.id}`).then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/fournisseurs").then(r => r.json()),
    ]).then(([item, cats, fours]) => {
      setForm({ reference: item.reference, nom: item.nom, description: item.description ?? "", categorieId: String(item.categorieId), marque: item.marque ?? "", modele: item.modele ?? "", numeroSerie: item.numeroSerie ?? "", etat: item.etat, dateAcquisition: item.dateAcquisition ? item.dateAcquisition.split("T")[0] : "", prixAcquisition: item.prixAcquisition ?? "", fournisseurId: item.fournisseurId ? String(item.fournisseurId) : "", quantite: String(item.quantite), notes: item.notes ?? "" });
      setCategories(cats);
      setFournisseurs(fours);
    });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/equipements/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/equipements/${params.id}`);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  if (!form) return <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>;

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Modifier l'équipement</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/equipements">Équipements</Link></li>
          <li><Link href={`/equipements/${params.id}`}>{form.reference}</Link></li>
          <li className="active">Modifier</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-warning">
          <div className="box-header with-border"><h3 className="box-title">Modifier la fiche équipement</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Référence *</label><input name="reference" className="form-control" value={form.reference} onChange={handleChange} required /></div>
                <div className="form-group"><label>Nom *</label><input name="nom" className="form-control" value={form.nom} onChange={handleChange} required /></div>
                <div className="form-group"><label>Catégorie *</label>
                  <select name="categorieId" className="form-control" value={form.categorieId} onChange={handleChange} required>
                    <option value="">-- Sélectionner --</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>État</label>
                  <select name="etat" className="form-control" value={form.etat} onChange={handleChange}>
                    {ETAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Marque</label><input name="marque" className="form-control" value={form.marque} onChange={handleChange} /></div>
                <div className="form-group"><label>Modèle</label><input name="modele" className="form-control" value={form.modele} onChange={handleChange} /></div>
                <div className="form-group"><label>Numéro de série</label><input name="numeroSerie" className="form-control" value={form.numeroSerie} onChange={handleChange} /></div>
                <div className="form-group"><label>Quantité</label><input name="quantite" type="number" min="1" className="form-control" value={form.quantite} onChange={handleChange} /></div>
                <div className="form-group"><label>Date d'acquisition</label><input name="dateAcquisition" type="date" className="form-control" value={form.dateAcquisition} onChange={handleChange} /></div>
                <div className="form-group"><label>Prix (DZD)</label><input name="prixAcquisition" type="number" step="0.01" className="form-control" value={form.prixAcquisition} onChange={handleChange} /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Fournisseur</label>
                  <select name="fournisseurId" className="form-control" value={form.fournisseurId} onChange={handleChange}>
                    <option value="">-- Aucun --</option>
                    {fournisseurs.map((f: any) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-warning" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer les modifications"}</button>
                <Link href={`/equipements/${params.id}`} className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

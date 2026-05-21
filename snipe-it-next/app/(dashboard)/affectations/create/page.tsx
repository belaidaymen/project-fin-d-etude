"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CreateAffectationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ equipementId: searchParams.get("equipementId") ?? "", localisationId: searchParams.get("localisationId") ?? "", quantite: "1", dateAffectation: new Date().toISOString().split("T")[0], notes: "" });
  const [equipements, setEquipements] = useState<any[]>([]);
  const [localisations, setLocalisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/equipements?perPage=200").then(r => r.json()).then(d => setEquipements(d.rows ?? []));
    fetch("/api/localisations").then(r => r.json()).then(setLocalisations);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/affectations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/affectations");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvelle affectation</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/affectations">Affectations</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Affecter un équipement à une localisation</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Équipement *</label>
                  <select name="equipementId" className="form-control" value={form.equipementId} onChange={handleChange} required>
                    <option value="">-- Sélectionner --</option>
                    {equipements.map((e: any) => <option key={e.id} value={e.id}>{e.reference} — {e.nom}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Localisation *</label>
                  <select name="localisationId" className="form-control" value={form.localisationId} onChange={handleChange} required>
                    <option value="">-- Sélectionner --</option>
                    {localisations.map((l: any) => <option key={l.id} value={l.id}>{l.nom} ({l.type})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Quantité</label><input name="quantite" type="number" min="1" className="form-control" value={form.quantite} onChange={handleChange} /></div>
                <div className="form-group"><label>Date d'affectation</label><input name="dateAffectation" type="date" className="form-control" value={form.dateAffectation} onChange={handleChange} /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer l'affectation"}</button>
                <Link href="/affectations" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

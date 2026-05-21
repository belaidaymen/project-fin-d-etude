"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "ACHAT", label: "Demande d'achat" },
  { value: "REMPLACEMENT", label: "Demande de remplacement" },
  { value: "REFORME", label: "Demande de réforme" },
  { value: "MAINTENANCE", label: "Demande de maintenance" },
];
const PRIORITE_OPTIONS = [
  { value: "BASSE", label: "Basse" }, { value: "NORMALE", label: "Normale" },
  { value: "HAUTE", label: "Haute" }, { value: "URGENTE", label: "Urgente" },
];

export default function CreateDemandePage() {
  const router = useRouter();
  const [form, setForm] = useState({ type: "ACHAT", titre: "", description: "", priorite: "NORMALE", equipementId: "", quantite: "", justification: "", notes: "" });
  const [equipements, setEquipements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/equipements?perPage=200").then(r => r.json()).then(d => setEquipements(d.rows ?? []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/demandes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/demandes/${data.id}`);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  const needsEquipement = ["REMPLACEMENT", "REFORME", "MAINTENANCE"].includes(form.type);

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvelle demande</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/demandes">Demandes</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Formulaire de demande</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Type de demande *</label>
                  <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Priorité</label>
                  <select name="priorite" className="form-control" value={form.priorite} onChange={handleChange}>
                    {PRIORITE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Titre *</label><input name="titre" className="form-control" value={form.titre} onChange={handleChange} required placeholder="Résumé court de la demande" /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description *</label><textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} required placeholder="Description détaillée de la demande" /></div>
                {needsEquipement && (
                  <div className="form-group"><label>Équipement concerné</label>
                    <select name="equipementId" className="form-control" value={form.equipementId} onChange={handleChange}>
                      <option value="">-- Sélectionner --</option>
                      {equipements.map((e: any) => <option key={e.id} value={e.id}>{e.reference} — {e.nom}</option>)}
                    </select>
                  </div>
                )}
                {form.type === "ACHAT" && (
                  <div className="form-group"><label>Quantité demandée</label><input name="quantite" type="number" min="1" className="form-control" value={form.quantite} onChange={handleChange} /></div>
                )}
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Justification</label><textarea name="justification" className="form-control" rows={2} value={form.justification} onChange={handleChange} placeholder="Pourquoi cette demande est-elle nécessaire ?" /></div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes supplémentaires</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Envoi en cours..." : "Soumettre la demande"}</button>
                <Link href="/demandes" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

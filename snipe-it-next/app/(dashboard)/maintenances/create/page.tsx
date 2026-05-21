"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const TYPE_OPTIONS = [
  { value: "PREVENTIVE", label: "Maintenance préventive" },
  { value: "CORRECTIVE", label: "Maintenance corrective" },
  { value: "REVISION", label: "Révision générale" },
];
const STATUT_OPTIONS = [
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "ANNULEE", label: "Annulée" },
];

export default function CreateMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ equipementId: searchParams.get("equipementId") ?? "", type: "PREVENTIVE", description: "", dateDebut: new Date().toISOString().split("T")[0], dateFin: "", cout: "", statut: "EN_COURS", notes: "" });
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
      const res = await fetch("/api/maintenances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/maintenances");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvelle maintenance</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/maintenances">Maintenances</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-warning">
          <div className="box-header with-border"><h3 className="box-title">Enregistrer une opération de maintenance</h3></div>
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
                <div className="form-group"><label>Type de maintenance</label>
                  <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                    {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Description *</label><textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} required placeholder="Décrivez les opérations effectuées ou prévues" /></div>
                <div className="form-group"><label>Date de début</label><input name="dateDebut" type="date" className="form-control" value={form.dateDebut} onChange={handleChange} /></div>
                <div className="form-group"><label>Date de fin (si terminée)</label><input name="dateFin" type="date" className="form-control" value={form.dateFin} onChange={handleChange} /></div>
                <div className="form-group"><label>Coût (DZD)</label><input name="cout" type="number" step="0.01" className="form-control" value={form.cout} onChange={handleChange} /></div>
                <div className="form-group"><label>Statut</label>
                  <select name="statut" className="form-control" value={form.statut} onChange={handleChange}>
                    {STATUT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-warning" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer la maintenance"}</button>
                <Link href="/maintenances" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

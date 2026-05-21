"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrateur" }, { value: "LOGISTICIEN", label: "Responsable Logistique" },
  { value: "MAGASINIER", label: "Magasinier" }, { value: "CHEF_LABO", label: "Responsable de Laboratoire" },
];

export default function CreateUtilisateurPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", prenom: "", username: "", email: "", password: "", role: "MAGASINIER", telephone: "", localisationId: "", notes: "", actif: true });
  const [localisations, setLocalisations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/localisations").then(r => r.json()).then(setLocalisations); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/utilisateurs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/utilisateurs");
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Nouvel utilisateur</h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li><Link href="/utilisateurs">Utilisateurs</Link></li><li className="active">Créer</li></ol>
      </section>
      <section className="content">
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Créer un compte utilisateur</h3></div>
          <div className="box-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                <div className="form-group"><label>Prénom *</label><input name="prenom" className="form-control" value={form.prenom} onChange={handleChange} required /></div>
                <div className="form-group"><label>Nom *</label><input name="nom" className="form-control" value={form.nom} onChange={handleChange} required /></div>
                <div className="form-group"><label>Identifiant *</label><input name="username" className="form-control" value={form.username} onChange={handleChange} required /></div>
                <div className="form-group"><label>Email *</label><input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required /></div>
                <div className="form-group"><label>Mot de passe *</label><input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required minLength={8} /></div>
                <div className="form-group"><label>Rôle</label>
                  <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Téléphone</label><input name="telephone" className="form-control" value={form.telephone} onChange={handleChange} /></div>
                <div className="form-group"><label>Localisation assignée</label>
                  <select name="localisationId" className="form-control" value={form.localisationId} onChange={handleChange}>
                    <option value="">-- Aucune --</option>
                    {localisations.map((l: any) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}><label>Notes</label><textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} /></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Création..." : "Créer le compte"}</button>
                <Link href="/utilisateurs" className="btn btn-default">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    jobTitle: string | null;
    phone: string | null;
    activated: boolean;
    laboratoireId: string | null;
  };
  locations: { id: string; name: string }[];
}

const ROLES = [
  { value: "LOGISTIQUE", label: "Responsable Logistique" },
  { value: "MAGASINIER", label: "Magasinier" },
  { value: "LABORATOIRE", label: "Responsable Laboratoire" },
];

export default function UserForm({ user, locations }: Props) {
  const router = useRouter();
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "LOGISTIQUE",
    jobTitle: user?.jobTitle ?? "",
    phone: user?.phone ?? "",
    activated: user?.activated ?? true,
    laboratoireId: user?.laboratoireId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload: any = { ...form, laboratoireId: form.laboratoireId || null };
      if (isEdit && !payload.password) delete payload.password;
      if (form.role !== "LABORATOIRE") payload.laboratoireId = null;
      const url = isEdit ? `/api/users/${user!.id}` : "/api/users";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");
      router.push(`/users/${data.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary">
      <div className="box-header with-border"><h3 className="box-title">{isEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}</h3></div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>Prénom *</label>
              <input name="firstName" className="form-control" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input name="lastName" className="form-control" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nom d'utilisateur *</label>
              <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{isEdit ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe *"}</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required={!isEdit} minLength={8} />
            </div>
            <div className="form-group">
              <label>Rôle *</label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Intitulé du poste</label>
              <input name="jobTitle" className="form-control" value={form.jobTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
            </div>
            {form.role === "LABORATOIRE" && (
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Laboratoire associé</label>
                <select name="laboratoireId" className="form-control" value={form.laboratoireId} onChange={handleChange}>
                  <option value="">— Sélectionner un laboratoire —</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <p className="help-block">Laboratoire dont cet utilisateur est responsable.</p>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
              <input name="activated" type="checkbox" checked={form.activated} onChange={handleChange} /> Compte actif
            </label>
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Enregistrement..." : "Enregistrer"}</button>
          <Link href="/users" className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Annuler</Link>
        </div>
      </form>
    </div>
  );
}

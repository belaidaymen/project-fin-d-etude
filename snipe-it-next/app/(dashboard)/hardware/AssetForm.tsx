"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  asset?: {
    id: string;
    assetTag: string;
    name: string | null;
    serial: string | null;
    reference: string | null;
    categoryId: string | null;
    statusId: string | null;
    locationId: string | null;
    purchaseDate: string | null;
    purchaseCost: string | null;
    notes: string | null;
    quantity: number;
  };
  categories: { id: string; name: string }[];
  statuses: { id: string; name: string; color: string | null }[];
  locations: { id: string; name: string }[];
}

export default function AssetForm({ asset, categories, statuses, locations }: Props) {
  const router = useRouter();
  const isEdit = !!asset;

  const [form, setForm] = useState({
    assetTag: asset?.assetTag ?? "",
    name: asset?.name ?? "",
    serial: asset?.serial ?? "",
    reference: asset?.reference ?? "",
    categoryId: asset?.categoryId ?? "",
    statusId: asset?.statusId ?? "",
    locationId: asset?.locationId ?? "",
    purchaseDate: asset?.purchaseDate ? asset.purchaseDate.slice(0, 10) : "",
    purchaseCost: asset?.purchaseCost ?? "",
    notes: asset?.notes ?? "",
    quantity: asset?.quantity?.toString() ?? "1",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        assetTag: form.assetTag,
        name: form.name || null,
        serial: form.serial || null,
        reference: form.reference || null,
        categoryId: form.categoryId || null,
        statusId: form.statusId || null,
        locationId: form.locationId || null,
        purchaseDate: form.purchaseDate || null,
        purchaseCost: form.purchaseCost || null,
        notes: form.notes || null,
        quantity: parseInt(form.quantity) || 1,
      };

      const url = isEdit ? `/api/assets/${asset!.id}` : "/api/assets";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");

      router.push(`/hardware/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="box box-primary">
      <div className="box-header with-border">
        <h3 className="box-title">{isEdit ? "Modifier l'équipement" : "Créer un équipement"}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>Étiquette d'équipement *</label>
              <input name="assetTag" className="form-control" value={form.assetTag} onChange={handleChange} required placeholder="ex: EQ-2024-001" />
            </div>
            <div className="form-group">
              <label>Nom / Désignation</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="ex: Ordinateur HP ProBook 450" />
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select name="categoryId" className="form-control" value={form.categoryId} onChange={handleChange}>
                <option value="">— Sélectionner —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select name="statusId" className="form-control" value={form.statusId} onChange={handleChange}>
                <option value="">— Sélectionner —</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Numéro de série</label>
              <input name="serial" className="form-control" value={form.serial} onChange={handleChange} placeholder="Numéro de série" style={{ fontFamily: "monospace" }} />
            </div>
            <div className="form-group">
              <label>Référence interne</label>
              <input name="reference" className="form-control" value={form.reference} onChange={handleChange} placeholder="ex: REF-LAB-001" />
            </div>
            <div className="form-group">
              <label>Emplacement</label>
              <select name="locationId" className="form-control" value={form.locationId} onChange={handleChange}>
                <option value="">— Sélectionner —</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantité</label>
              <input name="quantity" type="number" min="1" className="form-control" value={form.quantity} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Date d'achat</label>
              <input name="purchaseDate" type="date" className="form-control" value={form.purchaseDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Coût d'achat (DZD)</label>
              <input name="purchaseCost" type="number" step="0.01" className="form-control" value={form.purchaseCost} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} placeholder="Notes complémentaires..." />
          </div>
        </div>

        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={14} /> {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <Link href="/hardware" className="btn btn-default" style={{ marginLeft: 8 }}>
            <X size={14} /> Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

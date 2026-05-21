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
    modelId: string | null;
    statusId: string | null;
    supplierId: string | null;
    locationId: string | null;
    companyId: string | null;
    assignedToId: string | null;
    purchaseDate: string | null;
    purchaseCost: string | null;
    orderNumber: string | null;
    warrantyMonths: number | null;
    notes: string | null;
    requestable: boolean;
  };
  models: { id: string; name: string; manufacturer: string | null }[];
  statuses: { id: string; name: string; type: string }[];
  suppliers: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  users: { id: string; name: string }[];
}

export default function AssetForm({ asset, models, statuses, suppliers, locations, companies, users }: Props) {
  const router = useRouter();
  const isEdit = !!asset;

  const [form, setForm] = useState({
    assetTag: asset?.assetTag ?? "",
    name: asset?.name ?? "",
    serial: asset?.serial ?? "",
    modelId: asset?.modelId ?? "",
    statusId: asset?.statusId ?? "",
    supplierId: asset?.supplierId ?? "",
    locationId: asset?.locationId ?? "",
    companyId: asset?.companyId ?? "",
    assignedToId: asset?.assignedToId ?? "",
    purchaseDate: asset?.purchaseDate ? asset.purchaseDate.slice(0, 10) : "",
    purchaseCost: asset?.purchaseCost ?? "",
    orderNumber: asset?.orderNumber ?? "",
    warrantyMonths: asset?.warrantyMonths?.toString() ?? "",
    notes: asset?.notes ?? "",
    requestable: asset?.requestable ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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
        modelId: form.modelId || null,
        statusId: form.statusId || null,
        supplierId: form.supplierId || null,
        locationId: form.locationId || null,
        companyId: form.companyId || null,
        purchaseDate: form.purchaseDate || null,
        purchaseCost: form.purchaseCost || null,
        orderNumber: form.orderNumber || null,
        warrantyMonths: form.warrantyMonths ? parseInt(form.warrantyMonths) : null,
        notes: form.notes || null,
        requestable: form.requestable,
      };

      const url = isEdit ? `/api/assets/${asset!.id}` : "/api/assets";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save asset");

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
        <h3 className="box-title">{isEdit ? "Edit Asset" : "Create Asset"}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>Asset Tag *</label>
              <input name="assetTag" className="form-control" value={form.assetTag} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Asset Name</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="Optional name" />
            </div>
            <div className="form-group">
              <label>Model</label>
              <select name="modelId" className="form-control" value={form.modelId} onChange={handleChange}>
                <option value="">— Select Model —</option>
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.manufacturer ? `${m.manufacturer} — ` : ""}{m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="statusId" className="form-control" value={form.statusId} onChange={handleChange}>
                <option value="">— Select Status —</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input name="serial" className="form-control" value={form.serial} onChange={handleChange} placeholder="Serial number" style={{ fontFamily: "monospace" }} />
            </div>
            <div className="form-group">
              <label>Company</label>
              <select name="companyId" className="form-control" value={form.companyId} onChange={handleChange}>
                <option value="">— Select Company —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <select name="locationId" className="form-control" value={form.locationId} onChange={handleChange}>
                <option value="">— Select Location —</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select name="supplierId" className="form-control" value={form.supplierId} onChange={handleChange}>
                <option value="">— Select Supplier —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input name="purchaseDate" type="date" className="form-control" value={form.purchaseDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Purchase Cost</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ padding: "6px 10px", background: "#eee", border: "1px solid #d2d6de", borderRight: "none", borderRadius: "4px 0 0 4px", color: "#555" }}>$</span>
                <input name="purchaseCost" type="number" step="0.01" className="form-control" value={form.purchaseCost} onChange={handleChange} style={{ borderRadius: "0 4px 4px 0" }} />
              </div>
            </div>
            <div className="form-group">
              <label>Order Number</label>
              <input name="orderNumber" className="form-control" value={form.orderNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Warranty (months)</label>
              <input name="warrantyMonths" type="number" className="form-control" value={form.warrantyMonths} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, cursor: "pointer" }}>
              <input name="requestable" type="checkbox" checked={form.requestable} onChange={handleChange} />
              <span>Requestable (allow users to request this asset)</span>
            </label>
          </div>
        </div>

        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={14} /> {loading ? "Saving..." : "Save"}
          </button>
          <Link href="/hardware" className="btn btn-default" style={{ marginLeft: 8 }}>
            <X size={14} /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

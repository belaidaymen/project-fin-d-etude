"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  license?: {
    id: string; name: string; serial: string | null; seats: number; licenseName: string | null;
    licenseEmail: string | null; reassignable: boolean; maintained: boolean; notes: string | null;
    orderNumber: string | null; purchaseOrder: string | null; purchaseDate: string | null;
    purchaseCost: string | null; expirationDate: string | null; manufacturerId: string | null;
    supplierId: string | null; categoryId: string | null; companyId: string | null;
  };
  manufacturers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  companies: { id: string; name: string }[];
}

export default function LicenseForm({ license, manufacturers, categories, suppliers, companies }: Props) {
  const router = useRouter();
  const isEdit = !!license;
  const [form, setForm] = useState({
    name: license?.name ?? "",
    serial: license?.serial ?? "",
    seats: license?.seats?.toString() ?? "1",
    licenseName: license?.licenseName ?? "",
    licenseEmail: license?.licenseEmail ?? "",
    reassignable: license?.reassignable ?? true,
    maintained: license?.maintained ?? false,
    notes: license?.notes ?? "",
    orderNumber: license?.orderNumber ?? "",
    purchaseOrder: license?.purchaseOrder ?? "",
    purchaseDate: license?.purchaseDate ? license.purchaseDate.slice(0, 10) : "",
    purchaseCost: license?.purchaseCost ?? "",
    expirationDate: license?.expirationDate ? license.expirationDate.slice(0, 10) : "",
    manufacturerId: license?.manufacturerId ?? "",
    supplierId: license?.supplierId ?? "",
    categoryId: license?.categoryId ?? "",
    companyId: license?.companyId ?? "",
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
      const payload = { ...form, seats: parseInt(form.seats) || 1, purchaseCost: form.purchaseCost || null, purchaseDate: form.purchaseDate || null, expirationDate: form.expirationDate || null };
      const url = isEdit ? `/api/licenses/${license!.id}` : "/api/licenses";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/licenses/${data.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary">
      <div className="box-header with-border"><h3 className="box-title">{isEdit ? "Edit License" : "Create License"}</h3></div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>License Name *</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Serial Number</label>
              <input name="serial" className="form-control" value={form.serial} onChange={handleChange} style={{ fontFamily: "monospace" }} />
            </div>
            <div className="form-group">
              <label>Number of Seats *</label>
              <input name="seats" type="number" min="1" className="form-control" value={form.seats} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Licensed To (Name)</label>
              <input name="licenseName" className="form-control" value={form.licenseName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Licensed To (Email)</label>
              <input name="licenseEmail" type="email" className="form-control" value={form.licenseEmail} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <select name="manufacturerId" className="form-control" value={form.manufacturerId} onChange={handleChange}>
                <option value="">— Select —</option>
                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select name="supplierId" className="form-control" value={form.supplierId} onChange={handleChange}>
                <option value="">— Select —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="categoryId" className="form-control" value={form.categoryId} onChange={handleChange}>
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input name="purchaseDate" type="date" className="form-control" value={form.purchaseDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Purchase Cost</label>
              <input name="purchaseCost" type="number" step="0.01" className="form-control" value={form.purchaseCost} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Expiration Date</label>
              <input name="expirationDate" type="date" className="form-control" value={form.expirationDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Order Number</label>
              <input name="orderNumber" className="form-control" value={form.orderNumber} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
              <input name="reassignable" type="checkbox" checked={form.reassignable} onChange={handleChange} /> Reassignable
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
              <input name="maintained" type="checkbox" checked={form.maintained} onChange={handleChange} /> Maintained
            </label>
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
          <Link href="/licenses" className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  entityType: "accessory" | "consumable" | "component";
  item?: {
    id: string; name: string; modelNumber: string | null; qty: number; minAmt: number | null;
    purchaseDate: string | null; purchaseCost: string | null; orderNumber: string | null;
    image: string | null; notes: string | null; requestable: boolean;
    companyId: string | null; locationId: string | null; categoryId: string | null;
    manufacturerId: string | null; supplierId: string | null;
    itemNo?: string | null; serial?: string | null;
  };
  manufacturers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  companies: { id: string; name: string }[];
}

const LABELS: Record<string, string> = { accessory: "Accessory", consumable: "Consumable", component: "Component" };
const API_PATHS: Record<string, string> = { accessory: "/api/accessories", consumable: "/api/consumables", component: "/api/components" };
const LIST_PATHS: Record<string, string> = { accessory: "/accessories", consumable: "/consumables", component: "/components" };

export default function InventoryForm({ entityType, item, manufacturers, categories, suppliers, locations, companies }: Props) {
  const router = useRouter();
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    modelNumber: item?.modelNumber ?? "",
    serial: (item as any)?.serial ?? "",
    itemNo: (item as any)?.itemNo ?? "",
    qty: item?.qty?.toString() ?? "0",
    minAmt: item?.minAmt?.toString() ?? "",
    purchaseDate: item?.purchaseDate ? item.purchaseDate.slice(0, 10) : "",
    purchaseCost: item?.purchaseCost ?? "",
    orderNumber: item?.orderNumber ?? "",
    notes: item?.notes ?? "",
    requestable: item?.requestable ?? false,
    companyId: item?.companyId ?? "",
    locationId: item?.locationId ?? "",
    categoryId: item?.categoryId ?? "",
    manufacturerId: item?.manufacturerId ?? "",
    supplierId: item?.supplierId ?? "",
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
      const payload = {
        ...form,
        qty: parseInt(form.qty) || 0,
        minAmt: form.minAmt ? parseInt(form.minAmt) : null,
        purchaseCost: form.purchaseCost || null,
        purchaseDate: form.purchaseDate || null,
        orderNumber: form.orderNumber || null,
        notes: form.notes || null,
        modelNumber: form.modelNumber || null,
        companyId: form.companyId || null,
        locationId: form.locationId || null,
        categoryId: form.categoryId || null,
        manufacturerId: form.manufacturerId || null,
        supplierId: form.supplierId || null,
      };
      const url = isEdit ? `${API_PATHS[entityType]}/${item!.id}` : API_PATHS[entityType];
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(LIST_PATHS[entityType]);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary">
      <div className="box-header with-border"><h3 className="box-title">{isEdit ? "Edit" : "Create"} {LABELS[entityType]}</h3></div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>Name *</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Model Number</label>
              <input name="modelNumber" className="form-control" value={form.modelNumber} onChange={handleChange} />
            </div>
            {entityType === "consumable" && (
              <div className="form-group">
                <label>Item Number</label>
                <input name="itemNo" className="form-control" value={form.itemNo} onChange={handleChange} />
              </div>
            )}
            {entityType === "component" && (
              <div className="form-group">
                <label>Serial</label>
                <input name="serial" className="form-control" value={form.serial} onChange={handleChange} style={{ fontFamily: "monospace" }} />
              </div>
            )}
            <div className="form-group">
              <label>Quantity *</label>
              <input name="qty" type="number" min="0" className="form-control" value={form.qty} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Minimum Qty Alert</label>
              <input name="minAmt" type="number" min="0" className="form-control" value={form.minAmt} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <select name="manufacturerId" className="form-control" value={form.manufacturerId} onChange={handleChange}>
                <option value="">— Select —</option>
                {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
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
              <label>Supplier</label>
              <select name="supplierId" className="form-control" value={form.supplierId} onChange={handleChange}>
                <option value="">— Select —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <select name="locationId" className="form-control" value={form.locationId} onChange={handleChange}>
                <option value="">— Select —</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Company</label>
              <select name="companyId" className="form-control" value={form.companyId} onChange={handleChange}>
                <option value="">— Select —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <label>Order Number</label>
              <input name="orderNumber" className="form-control" value={form.orderNumber} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} />
          </div>
          {(entityType === "accessory" || entityType === "consumable") && (
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
                <input name="requestable" type="checkbox" checked={form.requestable} onChange={handleChange} /> Allow users to request this item
              </label>
            </div>
          )}
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
          <Link href={LIST_PATHS[entityType]} className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
        </div>
      </form>
    </div>
  );
}

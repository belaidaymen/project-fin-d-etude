"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

const MAINTENANCE_TYPES = ["Maintenance", "Repair", "Upgrade", "Hardware Support", "Software Support", "PAT Test", "Calibration", "Software Update", "Firmware Update"];

interface Props {
  assetId: string;
  assetTag: string;
  suppliers: { id: string; name: string }[];
}

export default function MaintenanceCreateForm({ assetId, assetTag, suppliers }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    maintenanceType: "Maintenance",
    startDate: today,
    completionDate: "",
    cost: "",
    supplierId: "",
    notes: "",
    isWarranty: false,
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
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/maintenances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, assetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log maintenance");
      router.push(`/hardware/${assetId}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary" style={{ maxWidth: 700 }}>
      <div className="box-header with-border">
        <h3 className="box-title">Log Maintenance: {assetTag}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>Title *</label>
              <input name="title" className="form-control" value={form.title} onChange={handleChange} required placeholder="Brief description" />
            </div>
            <div className="form-group">
              <label>Maintenance Type</label>
              <select name="maintenanceType" className="form-control" value={form.maintenanceType} onChange={handleChange}>
                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input name="startDate" type="date" className="form-control" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Completion Date</label>
              <input name="completionDate" type="date" className="form-control" value={form.completionDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Cost</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ padding: "6px 10px", background: "#eee", border: "1px solid #d2d6de", borderRight: "none", borderRadius: "4px 0 0 4px", color: "#555" }}>$</span>
                <input name="cost" type="number" step="0.01" min="0" className="form-control" value={form.cost} onChange={handleChange} style={{ borderRadius: "0 4px 4px 0" }} />
              </div>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select name="supplierId" className="form-control" value={form.supplierId} onChange={handleChange}>
                <option value="">— Select Supplier —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={3} />
          </div>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, cursor: "pointer" }}>
              <input name="isWarranty" type="checkbox" checked={form.isWarranty} onChange={handleChange} />
              <span>Is Warranty Repair</span>
            </label>
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={14} /> {loading ? "Saving..." : "Save Maintenance"}
          </button>
          <Link href={`/hardware/${assetId}`} className="btn btn-default" style={{ marginLeft: 8 }}>
            <X size={14} /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

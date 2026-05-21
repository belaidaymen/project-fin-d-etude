"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface FieldOption { value: string; label: string; }
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "color";
  required?: boolean;
  options?: FieldOption[];
  defaultValue?: string | number | boolean;
  placeholder?: string;
}

interface Props {
  entityType: string;
  apiUrl: string;
  backUrl: string;
  fields: Field[];
  item?: Record<string, any>;
}

export default function EntityForm({ entityType, apiUrl, backUrl, fields, item }: Props) {
  const router = useRouter();
  const isEdit = !!item;

  const initial: Record<string, any> = {};
  fields.forEach(f => {
    if (item && item[f.name] !== undefined) {
      initial[f.name] = f.type === "checkbox" ? !!item[f.name] : (item[f.name] ?? "");
    } else {
      initial[f.name] = f.type === "checkbox" ? (f.defaultValue ?? false) : (f.defaultValue ?? "");
    }
  });

  const [form, setForm] = useState(initial);
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
      const payload: Record<string, any> = {};
      fields.forEach(f => {
        const val = form[f.name];
        if (f.type === "number") payload[f.name] = val ? parseInt(val as string) : null;
        else if (f.type === "checkbox") payload[f.name] = !!val;
        else if (f.type === "select" || f.type === "text" || f.type === "textarea" || f.type === "color") {
          payload[f.name] = val === "" ? null : val;
        } else {
          payload[f.name] = val;
        }
      });

      const url = isEdit ? `${apiUrl}/${item.id}` : apiUrl;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      router.push(backUrl);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary" style={{ maxWidth: 800 }}>
      <div className="box-header with-border">
        <h3 className="box-title">{isEdit ? "Edit" : "Create"} {entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            {fields.map(field => {
              if (field.type === "checkbox") {
                return (
                  <div key={field.name} className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, cursor: "pointer" }}>
                      <input type="checkbox" name={field.name} checked={!!form[field.name]} onChange={handleChange} />
                      {field.label}
                    </label>
                  </div>
                );
              }
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>{field.label}{field.required && " *"}</label>
                    <textarea name={field.name} className="form-control" value={form[field.name] ?? ""} onChange={handleChange} rows={3} required={field.required} placeholder={field.placeholder} />
                  </div>
                );
              }
              if (field.type === "select") {
                return (
                  <div key={field.name} className="form-group">
                    <label>{field.label}{field.required && " *"}</label>
                    <select name={field.name} className="form-control" value={form[field.name] ?? ""} onChange={handleChange} required={field.required}>
                      <option value="">— Select —</option>
                      {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                );
              }
              if (field.type === "color") {
                return (
                  <div key={field.name} className="form-group">
                    <label>{field.label}</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="color" value={form[field.name] || "#3c8dbc"} onChange={e => setForm(prev => ({ ...prev, [field.name]: e.target.value }))} style={{ width: 50, height: 36, padding: 2, border: "1px solid #d2d6de", borderRadius: 4, cursor: "pointer" }} />
                      <input type="text" name={field.name} className="form-control" value={form[field.name] ?? ""} onChange={handleChange} placeholder="#rrggbb" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={field.name} className="form-group">
                  <label>{field.label}{field.required && " *"}</label>
                  <input type={field.type} name={field.name} className="form-control" value={form[field.name] ?? ""} onChange={handleChange} required={field.required} placeholder={field.placeholder} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
          <Link href={backUrl} className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
        </div>
      </form>
    </div>
  );
}

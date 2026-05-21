"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  user?: {
    id: string; firstName: string; lastName: string; username: string; email: string;
    employeeNum: string | null; jobTitle: string | null; phone: string | null; mobile: string | null;
    address: string | null; city: string | null; state: string | null; country: string | null;
    zip: string | null; notes: string | null; activated: boolean; isSuperAdmin: boolean;
    companyId: string | null; locationId: string | null; departmentId: string | null; managerId: string | null;
  };
  companies: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  managers: { id: string; name: string }[];
}

export default function UserForm({ user, companies, locations, departments, managers }: Props) {
  const router = useRouter();
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    employeeNum: user?.employeeNum ?? "",
    jobTitle: user?.jobTitle ?? "",
    phone: user?.phone ?? "",
    mobile: user?.mobile ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    country: user?.country ?? "",
    zip: user?.zip ?? "",
    notes: user?.notes ?? "",
    activated: user?.activated ?? true,
    isSuperAdmin: user?.isSuperAdmin ?? false,
    companyId: user?.companyId ?? "",
    locationId: user?.locationId ?? "",
    departmentId: user?.departmentId ?? "",
    managerId: user?.managerId ?? "",
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
      const payload = { ...form };
      if (isEdit && !payload.password) delete (payload as any).password;
      const url = isEdit ? `/api/users/${user!.id}` : "/api/users";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/users/${data.id}`);
      router.refresh();
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="box box-primary">
      <div className="box-header with-border"><h3 className="box-title">{isEdit ? "Edit User" : "Create User"}</h3></div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" className="form-control" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" className="form-control" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required={!isEdit} minLength={8} />
            </div>
            <div className="form-group">
              <label>Employee #</label>
              <input name="employeeNum" className="form-control" value={form.employeeNum} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input name="jobTitle" className="form-control" value={form.jobTitle} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Company</label>
              <select name="companyId" className="form-control" value={form.companyId} onChange={handleChange}>
                <option value="">— Select —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <label>Department</label>
              <select name="departmentId" className="form-control" value={form.departmentId} onChange={handleChange}>
                <option value="">— Select —</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Manager</label>
              <select name="managerId" className="form-control" value={form.managerId} onChange={handleChange}>
                <option value="">— None —</option>
                {managers.filter(m => m.id !== user?.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" className="form-control" value={form.notes} onChange={handleChange} rows={2} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
              <input name="activated" type="checkbox" checked={form.activated} onChange={handleChange} /> Active
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
              <input name="isSuperAdmin" type="checkbox" checked={form.isSuperAdmin} onChange={handleChange} /> Super Admin
            </label>
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}><Save size={14} /> {loading ? "Saving..." : "Save"}</button>
          <Link href="/users" className="btn btn-default" style={{ marginLeft: 8 }}><X size={14} /> Cancel</Link>
        </div>
      </form>
    </div>
  );
}

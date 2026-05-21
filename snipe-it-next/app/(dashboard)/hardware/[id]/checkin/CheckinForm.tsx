"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, X } from "lucide-react";

interface Props {
  assetId: string;
  assetTag: string;
  assignedTo: string | null;
  statuses: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}

export default function CheckinForm({ assetId, assetTag, assignedTo, statuses, locations }: Props) {
  const router = useRouter();
  const [statusId, setStatusId] = useState(statuses[0]?.id ?? "");
  const [locationId, setLocationId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${assetId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: statusId || null, locationId: locationId || null, note: note || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check in failed");
      router.push(`/hardware/${assetId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="box box-primary" style={{ maxWidth: 600 }}>
      <div className="box-header with-border">
        <h3 className="box-title">Check In: {assetTag}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {assignedTo && (
            <div className="alert alert-info">
              Currently checked out to: <strong>{assignedTo}</strong>
            </div>
          )}

          <div className="form-group">
            <label>New Status</label>
            <select className="form-control" value={statusId} onChange={e => setStatusId(e.target.value)}>
              <option value="">— Select Status —</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Return to Location</label>
            <select className="form-control" value={locationId} onChange={e => setLocationId(e.target.value)}>
              <option value="">— Select Location —</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <LogIn size={14} /> {loading ? "Processing..." : "Check In"}
          </button>
          <Link href={`/hardware/${assetId}`} className="btn btn-default" style={{ marginLeft: 8 }}>
            <X size={14} /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

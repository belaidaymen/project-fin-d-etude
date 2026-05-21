"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, X } from "lucide-react";

interface Props {
  assetId: string;
  assetTag: string;
  users: { id: string; name: string; email: string }[];
  locations: { id: string; name: string }[];
}

export default function CheckoutForm({ assetId, assetTag, users, locations }: Props) {
  const router = useRouter();
  const [checkoutType, setCheckoutType] = useState<"user" | "location">("user");
  const [userId, setUserId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [expectedCheckin, setExpectedCheckin] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${assetId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutType,
          userId: checkoutType === "user" ? userId : null,
          locationId: checkoutType === "location" ? locationId : null,
          expectedCheckin: expectedCheckin || null,
          note: note || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      router.push(`/hardware/${assetId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="box box-success" style={{ maxWidth: 640 }}>
      <div className="box-header with-border">
        <h3 className="box-title">Check Out: {assetTag}</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-group">
            <label>Check Out To</label>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
                <input type="radio" value="user" checked={checkoutType === "user"} onChange={() => setCheckoutType("user")} />
                User
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400, cursor: "pointer" }}>
                <input type="radio" value="location" checked={checkoutType === "location"} onChange={() => setCheckoutType("location")} />
                Location
              </label>
            </div>

            {checkoutType === "user" ? (
              <select className="form-control" value={userId} onChange={e => setUserId(e.target.value)} required>
                <option value="">— Select User —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            ) : (
              <select className="form-control" value={locationId} onChange={e => setLocationId(e.target.value)} required>
                <option value="">— Select Location —</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Expected Check-In Date</label>
            <input type="date" className="form-control" value={expectedCheckin} onChange={e => setExpectedCheckin(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="box-footer">
          <button type="submit" className="btn btn-success" disabled={loading}>
            <LogOut size={14} /> {loading ? "Processing..." : "Check Out"}
          </button>
          <Link href={`/hardware/${assetId}`} className="btn btn-default" style={{ marginLeft: 8 }}>
            <X size={14} /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

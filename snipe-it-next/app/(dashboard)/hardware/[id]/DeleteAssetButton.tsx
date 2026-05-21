"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteAssetButton({ id, assetTag }: { id: string; assetTag: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete asset ${assetTag}? This cannot be undone.`)) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    router.push("/hardware");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm">
      <Trash2 size={14} /> Delete
    </button>
  );
}

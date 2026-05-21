"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteLicenseButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  async function handleDelete() {
    if (!confirm(`Delete license "${name}"?`)) return;
    await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    router.push("/licenses");
    router.refresh();
  }
  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm">
      <Trash2 size={14} /> Delete
    </button>
  );
}

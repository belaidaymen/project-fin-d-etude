"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    router.push("/users");
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm">
      <Trash2 size={14} /> Delete
    </button>
  );
}

"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Delete" }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await action();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Are you sure?</span>
        <button onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleDelete} disabled={loading}
          className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-1 disabled:opacity-60">
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</> : "Yes, Delete"}
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

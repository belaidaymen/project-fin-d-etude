"use client";

import { useState } from "react";
import { checkoutAsset } from "@/lib/actions/assets";
import { prisma } from "@/lib/prisma";

interface CheckoutFormProps {
  assetId: number;
}

export function CheckoutForm({ assetId }: CheckoutFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
      >
        Checkout
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Checkout Asset</h2>
            </div>
            <form action={async (fd) => { await checkoutAsset(assetId, fd); setOpen(false); }}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Checkout To</label>
                  <select name="checkoutToType" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="user">User</option>
                    <option value="location">Location</option>
                    <option value="asset">Asset</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User / Location / Asset ID</label>
                  <input name="checkoutToId" type="number" min="1" required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Checkin</label>
                  <input name="expectedCheckin" type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea name="note" rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                  Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

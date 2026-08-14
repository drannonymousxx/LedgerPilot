"use client";

import React, { useState } from "react";
import { Category, Transaction } from "@/lib/types";

interface EditCategoryModalProps {
  transaction: Transaction | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categoryId: string) => Promise<void>;
}

export function EditCategoryModal({
  transaction,
  categories,
  isOpen,
  onClose,
  onConfirm,
}: EditCategoryModalProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>(
    transaction?.final_category_id || transaction?.ai_suggested_category_id || (categories[0]?.id ?? "")
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSave = async () => {
    if (!selectedCatId) return;
    setLoading(true);
    try {
      await onConfirm(selectedCatId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 bg-slate-900 border-slate-700 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Edit Category</h3>
        
        <div className="p-3 bg-slate-950/60 rounded-lg mb-4 border border-slate-800 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Vendor:</span>
            <span className="font-semibold text-white">{transaction.vendor_raw || "Unknown"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Amount:</span>
            <span className={transaction.amount_cents < 0 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
              {formatAmount(transaction.amount_cents)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Date:</span>
            <span className="text-slate-300">{transaction.transaction_date}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Organization Category
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="" disabled>Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Saving an edit will update this transaction's final category to "edited" and update the default category for this vendor.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedCatId}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

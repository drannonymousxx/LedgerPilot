"use client";

import React, { useState } from "react";
import { Transaction, Category } from "@/lib/types";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onReviewAction: (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => Promise<void>;
}

export function TransactionTable({ transactions, categories, onReviewAction }: TransactionTableProps) {
  const [loadingTxId, setLoadingTxId] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const formatCurrency = (cents: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(cents) / 100);
    return cents < 0 ? `-${formatted}` : formatted;
  };

  const getStatusBadge = (status: Transaction["review_status"]) => {
    switch (status) {
      case "approved":
        return <span className="badge-approved">Approved</span>;
      case "edited":
        return <span className="badge-edited">Edited</span>;
      case "rejected":
        return <span className="badge-rejected">Rejected</span>;
      default:
        return <span className="badge-pending">Pending Review</span>;
    }
  };

  const getConfidenceBadge = (confidence?: number | string | null) => {
    if (confidence === undefined || confidence === null) {
      return <span className="text-xs text-slate-500 font-mono">Unassigned</span>;
    }
    const val = typeof confidence === "string" ? parseFloat(confidence) : Number(confidence);
    if (isNaN(val) || val <= 0) {
      return <span className="text-xs text-slate-500 font-mono">Unassigned</span>;
    }
    const scorePct = Math.round(val * 100);
    let colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (scorePct < 60) colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    else if (scorePct < 85) colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";

    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${colorClass}`}>
        {scorePct}%
      </span>
    );
  };

  const handleAction = async (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => {
    setLoadingTxId(txId);
    try {
      await onReviewAction(txId, action, categoryId);
    } finally {
      setLoadingTxId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 text-sm">
        No transactions found matching the current filter. Upload a CSV or select another status filter.
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
            <tr>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Vendor</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">AI Category Suggestion</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Final Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {transactions.map((tx) => {
              const suggestedCatName = tx.ai_suggested_category_id
                ? categoryMap.get(tx.ai_suggested_category_id) || "Unknown"
                : "None";
              const finalCatName = tx.final_category_id
                ? categoryMap.get(tx.final_category_id) || "Unknown"
                : "—";

              const isLoading = loadingTxId === tx.id;

              return (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                    {tx.transaction_date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-white">
                    {tx.vendor_raw || "Unknown Vendor"}
                  </td>
                  <td
                    className={`py-3.5 px-4 whitespace-nowrap font-semibold font-mono ${
                      tx.amount_cents < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(tx.amount_cents)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                    {suggestedCatName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getConfidenceBadge(tx.ai_confidence)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-medium">
                    {finalCatName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(tx.review_status)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                    {isLoading ? (
                      <span className="text-xs text-slate-500">Updating...</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(tx.id, "approve")}
                          disabled={!tx.ai_suggested_category_id && !tx.final_category_id}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md transition-colors disabled:opacity-30"
                          title="Approve AI suggestion"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "edit")}
                          className="px-2.5 py-1 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md transition-colors"
                          title="Edit Category"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "reject")}
                          className="px-2.5 py-1 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md transition-colors"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

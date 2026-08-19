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
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-[#111111] text-white text-[10px] font-extrabold uppercase tracking-wide">
            Approved
          </span>
        );
      case "edited":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-[#F8F7F2] border border-black/15 text-[#111111] text-[10px] font-extrabold uppercase tracking-wide">
            Edited
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-black/5 text-black/40 border border-black/10 text-[10px] font-extrabold uppercase tracking-wide line-through">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-black/5 text-black/60 border border-black/10 text-[10px] font-extrabold uppercase tracking-wide">
            Pending
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence?: number | string | null) => {
    if (confidence === undefined || confidence === null) {
      return <span className="text-xs text-black/40 font-mono">—</span>;
    }
    const val = typeof confidence === "string" ? parseFloat(confidence) : Number(confidence);
    if (isNaN(val) || val <= 0) {
      return <span className="text-xs text-black/40 font-mono">—</span>;
    }
    const scorePct = Math.round(val * 100);

    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-black/15 bg-[#F8F7F2] text-[#111111] font-semibold">
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
      <div className="bg-white border border-black/10 rounded-2xl p-12 text-center text-black/50 text-xs shadow-sm font-medium">
        No transactions found matching the current filter.
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F7F2] border-b border-black/10 text-[11px] uppercase font-bold text-black/60">
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
          <tbody className="divide-y divide-black/5 text-[#111111]">
            {transactions.map((tx) => {
              const suggestedCatName = tx.ai_suggested_category_id
                ? categoryMap.get(tx.ai_suggested_category_id) || "Unknown"
                : "None";
              const finalCatName = tx.final_category_id
                ? categoryMap.get(tx.final_category_id) || "Unknown"
                : "—";

              const isLoading = loadingTxId === tx.id;

              return (
                <tr key={tx.id} className="hover:bg-[#F8F7F2]/60 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap text-black/60 font-mono text-xs">
                    {tx.transaction_date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-[#111111]">
                    {tx.vendor_raw || "Unknown Vendor"}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-bold font-mono text-[#111111]">
                    {formatCurrency(tx.amount_cents)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#111111]">
                    {suggestedCatName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getConfidenceBadge(tx.ai_confidence)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#111111]">
                    {finalCatName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(tx.review_status)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
                    {isLoading ? (
                      <span className="text-xs text-black/40 font-mono">Updating...</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(tx.id, "approve")}
                          disabled={(!tx.ai_suggested_category_id && !tx.final_category_id) || tx.review_status === "approved"}
                          className="px-2.5 py-1 text-xs font-bold bg-[#111111] hover:bg-black text-white rounded-lg transition-all shadow-sm disabled:opacity-30"
                          title="Approve AI suggestion"
                        >
                          {tx.review_status === "approved" ? "Approved ✓" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "edit")}
                          className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-black/5 text-[#111111] border border-black/15 rounded-lg transition-all shadow-sm"
                          title="Edit Category"
                        >
                          {tx.review_status === "edited" ? "Edited" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "reject")}
                          disabled={tx.review_status === "rejected"}
                          className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-black/5 text-black/60 border border-black/15 rounded-lg transition-all shadow-sm disabled:opacity-40"
                          title="Reject"
                        >
                          {tx.review_status === "rejected" ? "Rejected" : "Reject"}
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


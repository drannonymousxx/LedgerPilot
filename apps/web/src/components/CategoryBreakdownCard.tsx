import React from "react";
import { CategorySpendItem } from "@/lib/types";

interface CategoryBreakdownCardProps {
  items: CategorySpendItem[];
  totalSpendCents: number;
}

export function CategoryBreakdownCard({ items, totalSpendCents }: CategoryBreakdownCardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Spend by Category</h3>
      <p className="text-xs text-slate-400 mb-5">
        Human-confirmed transactions (approved & edited)
      </p>

      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No confirmed expense categories yet. Approve transactions in the review queue to see spend breakdown.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const percentage = totalSpendCents > 0 ? Math.round((item.total_cents / totalSpendCents) * 100) : 0;
            return (
              <div key={item.category_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-200">{item.category_name}</span>
                  <div className="text-right">
                    <span className="font-semibold text-white">{formatCurrency(item.total_cents)}</span>
                    <span className="text-xs text-slate-400 ml-2">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  {item.transaction_count} transaction{item.transaction_count !== 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

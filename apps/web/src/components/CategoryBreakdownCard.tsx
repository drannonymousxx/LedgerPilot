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
    <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-extrabold text-[#111111] mb-1">Spend by Category</h3>
      <p className="text-xs text-black/60 font-medium mb-6">
        Human-confirmed transactions (approved & edited)
      </p>

      {items.length === 0 ? (
        <div className="text-center py-10 space-y-1">
          <p className="text-sm font-bold text-[#111111]">No confirmed expense categories yet.</p>
          <p className="text-xs text-black/50 font-medium">
            Approve transactions in the review queue to see your spend breakdown.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const percentage = totalSpendCents > 0 ? Math.round((item.total_cents / totalSpendCents) * 100) : 0;
            return (
              <div key={item.category_id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-[#111111]">{item.category_name}</span>
                  <div className="text-right font-mono">
                    <span className="font-bold text-[#111111]">{formatCurrency(item.total_cents)}</span>
                    <span className="text-xs text-black/50 ml-2">({percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-[#F8F7F2] border border-black/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#111111] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, percentage))}%` }}
                  />
                </div>
                <div className="text-[11px] text-black/50 font-medium">
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


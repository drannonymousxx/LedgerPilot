"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { SummaryResponse, Transaction } from "@/lib/types";
import { KPICard } from "@/components/KPICard";
import { CategoryBreakdownCard } from "@/components/CategoryBreakdownCard";
import { TransactionTable } from "@/components/TransactionTable";
import { EditCategoryModal } from "@/components/EditCategoryModal";

export default function DashboardOverviewPage() {
  const { activeOrg, categories } = useOrg();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!activeOrg) return;
    setLoading(true);
    try {
      const [sumData, txData] = await Promise.all([
        api.getDashboardSummary(activeOrg.id),
        api.listTransactions(activeOrg.id, { page: 1, pageSize: 8 }),
      ]);
      setSummary(sumData);
      setRecentTransactions(txData.items);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleReviewAction = async (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => {
    if (!activeOrg) return;
    if (action === "edit" && !categoryId) {
      const txToEdit = recentTransactions.find((t) => t.id === txId);
      if (txToEdit) {
        setEditingTx(txToEdit);
      }
      return;
    }

    await api.reviewTransaction(activeOrg.id, txId, { action, category_id: categoryId });
    await loadDashboardData();
  };

  const handleModalConfirmEdit = async (categoryId: string) => {
    if (!activeOrg || !editingTx) return;
    await api.reviewTransaction(activeOrg.id, editingTx.id, { action: "edit", category_id: categoryId });
    setEditingTx(null);
    await loadDashboardData();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Finance Overview</h1>
          <p className="text-sm text-slate-400">
            {activeOrg?.name} {summary?.date_range?.start ? `• (${summary.date_range.start} to ${summary.date_range.end})` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
          >
            Refresh Data
          </button>
          <Link
            href="/dashboard/import"
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Import CSV
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Confirmed Spend"
          value={formatCurrency(summary?.total_spend_cents || 0)}
          subtitle="Expenses approved or edited"
          badgeText="Human Approved"
          badgeVariant="approved"
        />
        <KPICard
          title="Pending Reviews"
          value={summary?.pending_review_count || 0}
          subtitle="Awaiting human verification"
          badgeText={summary?.pending_review_count ? "Action Required" : "Queue Clear"}
          badgeVariant={summary?.pending_review_count ? "pending" : "approved"}
        />
        <KPICard
          title="Approved AI Suggestions"
          value={summary?.approved_count || 0}
          subtitle="AI suggestions accepted as-is"
          badgeText="Approved"
          badgeVariant="approved"
        />
        <KPICard
          title="Human Corrections"
          value={summary?.edited_count || 0}
          subtitle="Categories edited by human"
          badgeText="Edited"
          badgeVariant="edited"
        />
      </div>

      {/* Grid: Category Breakdown + Recent Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CategoryBreakdownCard
            items={summary?.spend_by_category || []}
            totalSpendCents={summary?.total_spend_cents || 0}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Transactions & Review Queue</h2>
            <Link
              href="/dashboard/transactions"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View Full Queue →
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel p-8 text-center text-slate-500 text-sm">
              Loading recent transactions...
            </div>
          ) : (
            <TransactionTable
              transactions={recentTransactions}
              categories={categories}
              onReviewAction={handleReviewAction}
            />
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      <EditCategoryModal
        transaction={editingTx}
        categories={categories}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onConfirm={handleModalConfirmEdit}
      />
    </div>
  );
}

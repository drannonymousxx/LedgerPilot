"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { SummaryResponse, Transaction } from "@/lib/types";
import { KPICard } from "@/components/KPICard";
import { CategoryBreakdownCard } from "@/components/CategoryBreakdownCard";
import { TransactionTable } from "@/components/TransactionTable";
import { EditCategoryModal } from "@/components/EditCategoryModal";
import { TeamCard } from "@/components/TeamCard";
import { CommunityChat } from "@/components/CommunityChat";

export default function DashboardOverviewPage() {
  const { token, user, selectOrg } = useAuth();
  const { activeOrg, organizations, categories } = useOrg();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!activeOrg || !token) return;
    setLoading(true);
    try {
      const [sumData, txData] = await Promise.all([
        api.getDashboardSummary(activeOrg.id, undefined, token),
        api.listTransactions(activeOrg.id, { page: 1, pageSize: 8 }, token),
      ]);
      setSummary(sumData);
      setRecentTransactions(txData.items);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg, token]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleReviewAction = async (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => {
    if (!activeOrg || !token) return;
    if (action === "edit" && !categoryId) {
      const txToEdit = recentTransactions.find((t) => t.id === txId);
      if (txToEdit) {
        setEditingTx(txToEdit);
      }
      return;
    }

    await api.reviewTransaction(activeOrg.id, txId, { action, category_id: categoryId }, token);
    await loadDashboardData();
  };

  const handleModalConfirmEdit = async (categoryId: string) => {
    if (!activeOrg || !editingTx || !token) return;
    await api.reviewTransaction(activeOrg.id, editingTx.id, { action: "edit", category_id: categoryId }, token);
    setEditingTx(null);
    await loadDashboardData();
  };

  const copyInviteCode = () => {
    if (activeOrg?.invite_code) {
      navigator.clipboard.writeText(activeOrg.invite_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      {/* Top Bar with Org Selector & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Finance Overview
            </h1>

            {/* Organization Dropdown */}
            {organizations.length > 1 && (
              <select
                value={activeOrg?.id || ""}
                onChange={(e) => selectOrg(e.target.value)}
                className="bg-white border border-black/15 text-xs font-semibold text-[#111111] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.role})
                  </option>
                ))}
              </select>
            )}
          </div>

          <p className="text-sm text-black/60 font-medium flex items-center gap-2 mt-1">
            <span>{activeOrg?.name}</span>
            {activeOrg?.invite_code && (
              <button
                type="button"
                onClick={copyInviteCode}
                className="text-xs bg-[#F8F7F2] hover:bg-black/5 text-[#111111] border border-black/15 px-2.5 py-1 rounded-lg font-mono font-semibold transition-colors shadow-sm"
                title="Click to copy invite code"
              >
                {copiedCode ? "✓ Copied!" : `Invite Code: ${activeOrg.invite_code}`}
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadDashboardData}
            className="px-4 py-2.5 text-xs font-semibold text-[#111111] bg-white border border-black/15 hover:bg-black/5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Refresh Data
          </button>

          <Link
            href="/dashboard/import"
            className="px-4 py-2.5 text-xs font-bold bg-[#111111] hover:bg-black text-white rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <span>+ Import CSV</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Confirmed Spend"
          value={formatCurrency(summary?.total_spend_cents || 0)}
          subtitle="Human approved expenses"
        />
        <KPICard
          title="Pending Reviews"
          value={summary?.pending_review_count || 0}
          subtitle={summary?.pending_review_count ? "Action required" : "Queue clear"}
        />
        <KPICard
          title="Approved AI Suggestions"
          value={summary?.approved_count || 0}
          subtitle="Approved suggestions"
        />
        <KPICard
          title="Human Corrections"
          value={summary?.edited_count || 0}
          subtitle="Categories edited by humans"
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
            <h2 className="text-lg font-bold text-[#111111] tracking-tight">Recent Transactions & Review Queue</h2>
            <Link
              href="/dashboard/transactions"
              className="text-xs font-semibold text-[#111111] hover:underline transition-colors flex items-center gap-1"
            >
              View Full Queue →
            </Link>
          </div>

          {loading ? (
            <div className="bg-white border border-black/10 rounded-[24px] p-8 text-center text-black/50 text-sm">
              Loading transactions from real database...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-[24px] p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto text-black/60">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111111]">No Transactions Found</h3>
                <p className="text-xs text-black/60 max-w-sm mx-auto mt-1">
                  Your organization <strong className="text-black">{activeOrg?.name}</strong> has no transaction data yet. Import your first CSV to run AI categorization.
                </p>
              </div>
              <Link
                href="/dashboard/import"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-full transition-all shadow-sm"
              >
                Import First CSV →
              </Link>
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

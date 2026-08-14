"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { Transaction } from "@/lib/types";
import { TransactionTable } from "@/components/TransactionTable";
import { EditCategoryModal } from "@/components/EditCategoryModal";

export default function TransactionsReviewQueuePage() {
  const { activeOrg, categories } = useOrg();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!activeOrg) return;
    setLoading(true);
    try {
      const res = await api.listTransactions(activeOrg.id, {
        status: statusFilter,
        categoryId: categoryFilter || undefined,
        page,
        pageSize,
      });
      setTransactions(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg, statusFilter, categoryFilter, page, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleReviewAction = async (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => {
    if (!activeOrg) return;
    if (action === "edit" && !categoryId) {
      const txToEdit = transactions.find((t) => t.id === txId);
      if (txToEdit) {
        setEditingTx(txToEdit);
      }
      return;
    }

    await api.reviewTransaction(activeOrg.id, txId, { action, category_id: categoryId });
    await fetchTransactions();
  };

  const handleModalConfirmEdit = async (categoryId: string) => {
    if (!activeOrg || !editingTx) return;
    await api.reviewTransaction(activeOrg.id, editingTx.id, { action: "edit", category_id: categoryId });
    setEditingTx(null);
    await fetchTransactions();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions & AI Review Queue</h1>
          <p className="text-sm text-slate-400">
            Review, approve, or edit AI-suggested category allocations for {activeOrg?.name}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Transactions" },
            { id: "pending", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "edited", label: "Edited" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="glass-panel p-12 text-center text-slate-500 text-sm">
          Loading transaction review queue...
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          categories={categories}
          onReviewAction={handleReviewAction}
        />
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing {transactions.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, total)} of {total} transactions
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            Previous
          </button>

          <span className="px-2 font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            Next
          </button>
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

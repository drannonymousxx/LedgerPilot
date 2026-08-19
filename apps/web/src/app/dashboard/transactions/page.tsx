"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { Transaction } from "@/lib/types";
import { TransactionTable } from "@/components/TransactionTable";
import { EditCategoryModal } from "@/components/EditCategoryModal";

export default function TransactionsReviewQueuePage() {
  const { token } = useAuth();
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
    if (!activeOrg || !token) return;
    setLoading(true);
    try {
      const res = await api.listTransactions(activeOrg.id, {
        status: statusFilter,
        categoryId: categoryFilter || undefined,
        page,
        pageSize,
      }, token);
      setTransactions(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg, token, statusFilter, categoryFilter, page, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleReviewAction = async (txId: string, action: "approve" | "edit" | "reject", categoryId?: string) => {
    if (!activeOrg || !token) return;
    if (action === "edit" && !categoryId) {
      const txToEdit = transactions.find((t) => t.id === txId);
      if (txToEdit) {
        setEditingTx(txToEdit);
      }
      return;
    }

    await api.reviewTransaction(activeOrg.id, txId, { action, category_id: categoryId }, token);
    await fetchTransactions();
  };

  const handleModalConfirmEdit = async (categoryId: string) => {
    if (!activeOrg || !editingTx || !token) return;
    await api.reviewTransaction(activeOrg.id, editingTx.id, { action: "edit", category_id: categoryId }, token);
    setEditingTx(null);
    await fetchTransactions();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">Review Queue</h1>
          <p className="text-sm text-black/60 font-medium mt-1">
            Review, approve, or edit AI-suggested category allocations for{" "}
            <span className="font-bold text-[#111111]">{activeOrg?.name}</span>.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#111111] text-white font-extrabold shadow-sm"
                    : "text-black/70 hover:text-black hover:bg-black/5"
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
            className="bg-[#F8F7F2] border border-black/15 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
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
        <div className="bg-white border border-black/10 rounded-2xl p-12 text-center text-black/50 text-xs shadow-sm font-medium">
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
      <div className="flex items-center justify-between text-xs text-black/60 px-1 font-medium">
        <span>
          Showing {transactions.length > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, total)} of {total} transactions
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-1.5 bg-white border border-black/15 rounded-xl text-[#111111] font-semibold hover:bg-black/5 disabled:opacity-40 shadow-sm transition-all"
          >
            Previous
          </button>

          <span className="px-2 font-mono text-black/70">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3.5 py-1.5 bg-white border border-black/15 rounded-xl text-[#111111] font-semibold hover:bg-black/5 disabled:opacity-40 shadow-sm transition-all"
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

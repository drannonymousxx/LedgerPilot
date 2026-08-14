import {
  Organization,
  Category,
  Transaction,
  PaginatedTransactionsResponse,
  SummaryResponse,
  CSVImportResponse,
  TransactionReviewRequest,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Failed to parse JSON error, use HTTP status text
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await fetch(`${API_BASE}/organizations`);
    return handleResponse<Organization[]>(res);
  },

  async createOrganization(name: string): Promise<Organization> {
    const res = await fetch(`${API_BASE}/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return handleResponse<Organization>(res);
  },

  // Categories
  async getCategories(organizationId: string): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/categories`);
    return handleResponse<Category[]>(res);
  },

  // Transactions
  async listTransactions(
    organizationId: string,
    params?: { status?: string; categoryId?: string; page?: number; pageSize?: number }
  ): Promise<PaginatedTransactionsResponse> {
    const searchParams = new URLSearchParams({ organization_id: organizationId });
    if (params?.status && params.status !== "all") {
      searchParams.append("status", params.status);
    }
    if (params?.categoryId) {
      searchParams.append("category_id", params.categoryId);
    }
    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.pageSize) {
      searchParams.append("page_size", params.pageSize.toString());
    }

    const res = await fetch(`${API_BASE}/transactions?${searchParams.toString()}`);
    return handleResponse<PaginatedTransactionsResponse>(res);
  },

  async importCSV(organizationId: string, file: File): Promise<CSVImportResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/transactions/import?organization_id=${organizationId}`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<CSVImportResponse>(res);
  },

  async reviewTransaction(
    organizationId: string,
    transactionId: string,
    reviewReq: TransactionReviewRequest
  ): Promise<Transaction> {
    const searchParams = new URLSearchParams({ organization_id: organizationId });
    if (reviewReq.user_id) {
      searchParams.append("user_id", reviewReq.user_id);
    }

    const res = await fetch(`${API_BASE}/transactions/${transactionId}/review?${searchParams.toString()}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewReq),
    });
    return handleResponse<Transaction>(res);
  },

  // Reports
  async getDashboardSummary(
    organizationId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<SummaryResponse> {
    const searchParams = new URLSearchParams({ organization_id: organizationId });
    if (params?.startDate) searchParams.append("start_date", params.startDate);
    if (params?.endDate) searchParams.append("end_date", params.endDate);

    const res = await fetch(`${API_BASE}/reports/summary?${searchParams.toString()}`);
    return handleResponse<SummaryResponse>(res);
  },
};

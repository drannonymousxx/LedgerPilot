import {
  Organization,
  UserProfile,
  Category,
  Transaction,
  PaginatedTransactionsResponse,
  SummaryResponse,
  CSVImportResponse,
  TransactionReviewRequest,
  AuthMeResponse,
  OrgMembership,
  InitialInviteRequest,
  TeamMember,
  ChatMessage,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorDetail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Failed to parse JSON error
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth & User Synchronization
  async getAuthMe(token: string): Promise<AuthMeResponse> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<AuthMeResponse>(res);
  },

  async createOrgAuth(
    token: string,
    name: string,
    password?: string,
    initialInvitations?: InitialInviteRequest[]
  ): Promise<OrgMembership> {
    const res = await fetch(`${API_BASE}/auth/create-org`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name, password, initial_invitations: initialInvitations || [] }),
    });
    return handleResponse<OrgMembership>(res);
  },

  async joinOrgAuth(
    token: string,
    inviteCodeOrId: string,
    password?: string,
    requestedRole?: string
  ): Promise<OrgMembership> {
    const res = await fetch(`${API_BASE}/auth/join-org`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        invite_code_or_id: inviteCodeOrId,
        password: password || undefined,
        requested_role: requestedRole || "accountant",
      }),
    });
    return handleResponse<OrgMembership>(res);
  },

  async updateUserProfile(token: string, fullName: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ full_name: fullName }),
    });
    return handleResponse<UserProfile>(res);
  },

  // Organizations
  async getOrganizations(token?: string | null): Promise<Organization[]> {
    const res = await fetch(`${API_BASE}/organizations`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<Organization[]>(res);
  },

  async setOrganizationPassword(
    organizationId: string,
    newPassword: string,
    token?: string | null
  ): Promise<{ status: string; message: string; has_password: boolean }> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/password`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ new_password: newPassword }),
    });
    return handleResponse<{ status: string; message: string; has_password: boolean }>(res);
  },

  async inviteOrganizationMember(
    organizationId: string,
    email: string,
    name?: string,
    role?: string,
    token?: string | null
  ): Promise<TeamMember> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/invitations`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ email, name: name || undefined, role: role || "accountant" }),
    });
    return handleResponse<TeamMember>(res);
  },

  async getOrganizationMembers(organizationId: string, token?: string | null): Promise<TeamMember[]> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/members`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<TeamMember[]>(res);
  },

  // Community Chat
  async getOrganizationMessages(organizationId: string, token?: string | null): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/messages`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<ChatMessage[]>(res);
  },

  async sendOrganizationMessage(organizationId: string, message: string, token?: string | null): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ message }),
    });
    return handleResponse<ChatMessage>(res);
  },

  // Categories
  async getCategories(organizationId: string, token?: string | null): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/organizations/${organizationId}/categories`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<Category[]>(res);
  },

  // Transactions
  async listTransactions(
    organizationId: string,
    params?: { status?: string; categoryId?: string; page?: number; pageSize?: number },
    token?: string | null
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

    const res = await fetch(`${API_BASE}/transactions?${searchParams.toString()}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<PaginatedTransactionsResponse>(res);
  },

  async importCSV(organizationId: string, file: File, token?: string | null): Promise<CSVImportResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/transactions/import?organization_id=${organizationId}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse<CSVImportResponse>(res);
  },

  async reviewTransaction(
    organizationId: string,
    transactionId: string,
    reviewReq: TransactionReviewRequest,
    token?: string | null
  ): Promise<Transaction> {
    const searchParams = new URLSearchParams({ organization_id: organizationId });

    const res = await fetch(`${API_BASE}/transactions/${transactionId}/review?${searchParams.toString()}`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewReq),
    });
    return handleResponse<Transaction>(res);
  },

  // Reports
  async getDashboardSummary(
    organizationId: string,
    params?: { startDate?: string; endDate?: string },
    token?: string | null
  ): Promise<SummaryResponse> {
    const searchParams = new URLSearchParams({ organization_id: organizationId });
    if (params?.startDate) searchParams.append("start_date", params.startDate);
    if (params?.endDate) searchParams.append("end_date", params.endDate);

    const res = await fetch(`${API_BASE}/reports/summary?${searchParams.toString()}`, {
      headers: getAuthHeaders(token),
    });
    return handleResponse<SummaryResponse>(res);
  },
};

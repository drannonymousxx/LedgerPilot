export interface Organization {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  organization_id: string;
  name: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  vendor_id?: string | null;
  vendor_raw?: string | null;
  amount_cents: number;
  currency: string;
  transaction_date: string;
  description?: string | null;
  ai_suggested_category_id?: string | null;
  ai_confidence?: number | string | null;
  final_category_id?: string | null;
  review_status: 'pending' | 'approved' | 'edited' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  source: string;
  created_at: string;
}

export interface PaginatedTransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
}

export interface CategorySpendItem {
  category_id: string;
  category_name: string;
  total_cents: number;
  transaction_count: number;
}

export interface DateRange {
  start?: string | null;
  end?: string | null;
}

export interface SummaryResponse {
  total_transactions: number;
  pending_review_count: number;
  approved_count: number;
  edited_count: number;
  rejected_count: number;
  total_spend_cents: number;
  total_revenue_cents: number;
  spend_by_category: CategorySpendItem[];
  date_range: DateRange;
}

export interface RowError {
  row: number;
  reason: string;
}

export interface CSVImportResponse {
  imported_count: number;
  skipped_count: number;
  errors: RowError[];
}

export interface TransactionReviewRequest {
  action: 'approve' | 'edit' | 'reject';
  category_id?: string;
  user_id?: string;
}

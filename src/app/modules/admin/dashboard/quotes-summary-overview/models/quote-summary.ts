export interface QuoteSummaryDTO {
  startDate: string;
  endDate: string;
  items: QuoteSummaryItemDTO[];
}

export interface QuoteSummaryItemDTO {
  planName: string;
  count: number;
}

export interface QuoteStatusCountDTO {
  draftCount: number;
  pendingApprovalCount: number;
  rejectedCount: number;
  acceptedCount: number;
}

export interface QuotesPerDayDTO {
  date: string;
  statusCounts: { draft: number; accepted: number; rejected: number; pending_approval: number };
}
export interface QuoteTotalPriceDTO {
  draftCount: number;
  rejectedCount: number;
  acceptedCount: number;
  acceptedTotalValue: number;
  rejectedTotalValue: number;
  draftTotalValue: number;
}

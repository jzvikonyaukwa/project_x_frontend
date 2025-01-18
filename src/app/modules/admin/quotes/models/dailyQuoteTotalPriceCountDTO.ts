export interface DailyQuoteTotalPriceCountDTO {
  dailyTotals: { [key: string]: QuoteTotalPriceCountDTO };
}

export interface QuoteTotalPriceCountDTO {
  acceptedCount: number;
  rejectedCount: number;
  draftCount: number;
  acceptedTotalValue: number;
  rejectedTotalValue: number;
  draftTotalValue: number;
  date: string;
}

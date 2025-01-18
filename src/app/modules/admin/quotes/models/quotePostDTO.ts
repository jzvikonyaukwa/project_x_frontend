import { QuoteStatus } from "@shared/enums/quote-status";
import { QuotePrice } from "@shared/models/quotePrice";

export interface QuotePostDTO {
  clientId: number;
  projectId: number;
  dateIssued?: string;
  status?: QuoteStatus;
  notes: string;
  quotePrice: QuotePrice;
}

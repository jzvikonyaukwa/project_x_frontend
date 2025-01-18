import { QuotePrice } from '@shared/models/quotePrice';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { QuoteStatus } from '@shared/enums/quote-status';
import { RejectionReason } from '@shared/models/rejectionReason';
import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';
import { Project } from '../../projects/models/project';

export interface Quote {
  id?: number;
  dateIssued: Date | string;
  dateLastModified: Date | string | null;
  dateAccepted: Date | string | null;
  dateRejected: Date | string | null;
  status: QuoteStatus;
  notes: string | null;
  paid: boolean;
  project: Project;
  products: ProductDTO[];
  quotePrice: QuotePrice;
  rejectedReason?: RejectionReason;
  consumablesOnQuote: ConsumableOnQuote[];
}

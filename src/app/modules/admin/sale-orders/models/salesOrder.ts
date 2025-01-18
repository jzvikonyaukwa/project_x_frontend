import { Invoice } from "../../invoices/models/invoice";
import { Quote } from "../../quotes/models/quote";

export interface SaleOrder {
  id: number;
  dateIssued: Date;
  status: string;
  quote: Quote;
  invoice: Invoice[];
}

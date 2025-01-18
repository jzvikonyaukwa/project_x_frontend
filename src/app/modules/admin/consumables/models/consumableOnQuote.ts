import { QuotePrice } from "@shared/models/quotePrice";
import { Consumable } from "./consumable";

export interface ConsumableOnQuote {
  id?: number;
  qty: number;
  costPrice: number;
  sellPrice: number;
  hasCustomMarkup: boolean;
  consumable: Consumable;
  invoiceId?: number; 
}

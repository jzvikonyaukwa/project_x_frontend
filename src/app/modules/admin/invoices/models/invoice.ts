import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

export interface Invoice {
  id: number;
  dateInvoiced: Date;
  paid: boolean;
  productDTOList: ProductDTO[];
  consumablesOnQuote: ConsumableOnQuote[];
}

export interface TotalValues {
  subTotal: number;
  taxedPrice: number;
  totalPrice: number;
}

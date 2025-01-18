import { AggregatedProduct } from 'app/modules/admin/aggregated-products/aggregatedProducts';

export interface StockOnHand {
  id: number;
  status: string;
  productName: string;
  datePicked: Date | null;
  dateAdded: Date;
  aggregatedProduct: AggregatedProduct;
}

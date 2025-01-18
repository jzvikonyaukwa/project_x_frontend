import { AggregatedProduct } from 'app/modules/admin/aggregated-products/aggregatedProducts';

export interface AggregatedProductWithPickable extends AggregatedProduct {
  pickable: boolean;
  stockOnHandId: number;
}

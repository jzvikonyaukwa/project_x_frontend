import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';

export interface PickedStockPostDTO {
  // productType: ProductType;
  coilNumber: string;
  // length: number;
  aggregateProduct: AggregatedProduct;
}

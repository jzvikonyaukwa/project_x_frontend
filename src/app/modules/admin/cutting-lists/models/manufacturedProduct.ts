import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';

// TODO check if it is being used if not remove it
export interface ManufacturedProduct {
  id?: number;
  frameName: string;
  frameType: string;
  status: string;
  totalLength: number;
  totalQuantity: number;
  cuttingListId?: number;
  inventoryId?: number;
  aggregatedProducts: AggregatedProduct[];
}

export interface ManufacturedProductWithPickable extends ManufacturedProduct {
  pickable: boolean;
}

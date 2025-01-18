import {AggregatedProduct} from "../../aggregated-products/aggregatedProducts";

export interface GroupedFramecadMPs {
  id: number;
  planName?: string;
  frameType: string;
  frameName: string;
  mp: AggregatedProduct;
  pickable: boolean;
  remainingQty: number;
  completedQty: number;
  lengthRemaining: number;
}

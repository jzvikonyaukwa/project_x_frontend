import { Gauge } from "@shared/models/gauge";

// TODO: is this being used???
export interface PriceAndProductTypeDTO {
  cuttingListId: number;
  productTypeId: number;
  pricePerMeter: number;
  gauge: Gauge;
  datePriceUpdated: Date;
  datePriceSet: Date;
}

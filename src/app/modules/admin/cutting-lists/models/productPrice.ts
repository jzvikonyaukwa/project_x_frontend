export interface ProductPrice {
  id?: number;
  pricePerMeter: number;
  datePriceSet: Date;
  datePriceUpdated: Date;
  pricingBasedStock: boolean;
}

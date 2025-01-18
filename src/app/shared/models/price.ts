import { Color } from '@shared/models/color';

export interface Price {
  id: number;
  stdPrice: number;
  tradesMenPrice: number;
  color: Color;
  productTypeId: number;
  // productType: ProductType;
}

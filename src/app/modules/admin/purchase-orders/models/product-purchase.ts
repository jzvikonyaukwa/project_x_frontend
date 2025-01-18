import { SteelSpecification } from '../../../../shared/models/steelSpecification';

export interface ProductPurchase {
  id: number;
  qty: number;
  weightOrdered: number;
  purchaseCostPerKg: number;
  status: string;
  steelSpecification: SteelSpecification;
}

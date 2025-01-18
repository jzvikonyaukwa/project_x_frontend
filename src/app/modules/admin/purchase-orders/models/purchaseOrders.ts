import { Grv } from '../../grvs/models/grv';
import { SupplierDto } from '../../suppliers/models/supplierDto';
import { ConsumablesOnPurchaseOrder } from './consumablesOnPurcahseOrder';
import { ProductPurchase } from './product-purchase';

export interface PurchaseOrder {
  id: number;
  expectedDeliveryDate: Date;
  dateIssued: Date;
  paid: boolean;
  notes?: string | null;
  status: string;
  supplier: SupplierDto;
  productPurchases: ProductPurchase[];
  consumablesOnPurchaseOrders: ConsumablesOnPurchaseOrder[];
  grvs: Grv[];
}

import { SteelCoilPostDTO } from "@shared/models/steelCoilPostDTO";
import { ConsumablesOnPurchaseOrder } from "./consumablesOnPurcahseOrder";

export interface PurchaseOrderPostDTO {
  purchaseOrderId?: number;
  supplierId: number;
  dateIssued: string;
  expectedDeliveryDate: string;
  comments: string;
  status: string;
  paid: boolean;
  productPurchases: SteelCoilPostDTO[];
  consumablesOnPurchaseOrder: ConsumablesOnPurchaseOrder[];
}

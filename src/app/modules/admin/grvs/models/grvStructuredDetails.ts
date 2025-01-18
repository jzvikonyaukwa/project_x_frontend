import { SteelCoilPostDTO } from "@shared/models/steelCoilPostDTO";
import { Warehouse } from "../../warehouses/warehouse";
import { ConsumablePostDTO } from "../../consumables/models/consumablePostDTO";

export interface GRVDetailsDTO {
  id: number;
  dateReceived: Date;
  comments: string;
  paid: boolean;
  supplierGrvCode: string;
  supplierId: number;
  purchaseOrderId: number;
  warehouse: Warehouse;
  steelCoils: SteelCoilPostDTO[];
  consumablesOnGrv: ConsumablePostDTO[];
}

import { Consumable } from "../../consumables/models/consumable";

export interface ConsumablesOnPurchaseOrder {
  id: number;
  qty: number;
  costPerUnit: number;
  status: string;
  consumable: Consumable;
}

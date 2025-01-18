import { Warehouse } from "../../warehouses/warehouse";
import { Consumable } from "./consumable";

export interface ConsumableInWarehouse {
  id?: number;
  qty: number;
  avgLandedPrice: number;
  consumable: Consumable;
  warehouse: Warehouse;
}

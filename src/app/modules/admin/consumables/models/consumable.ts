import { ProductCategory } from "./productCategory";
import { Source } from "./source";

export interface Consumable {
  id?: number;
  serialNumber: string;
  name: string;
  minQtyAlertOwned: number;
  minQtyAlertConsignment: number;
  uom: string;
  sourceCountry: Source;
  category: ProductCategory;
}

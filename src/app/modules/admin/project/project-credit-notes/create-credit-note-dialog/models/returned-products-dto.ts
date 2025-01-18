import {ManufacturedProduct} from "../../../../cutting-lists/models/manufacturedProduct";
import {ConsumableOnQuote} from "../../../../consumables/models/consumableOnQuote";
import {InventoryItem} from "../../../../inventory/models/inventoryItem";

export interface ReturnedProductsDto {
    id?: number;
    returnedDate:Date;
    reason: string;
    inventories: InventoryItem[];
    manufacturedProduct?: ManufacturedProduct;
    consumable?: ConsumableOnQuote;

}
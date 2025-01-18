import { Warehouse } from "../../warehouses/warehouse";

interface Consumable {
    id: number;
    serialNumber: string;
    name: string;
    uom: string;
    minQtyAlertOwned: number;
    minQtyAlertConsignment: number;
    sourceCountry: {
        id: number;
        country: string;
    };
    category: {
        id: number;
        name: string;
    };
}

export interface ConsignorConsumable {
    id: number;
    qty: number;
    avgLandedPrice: number;
    consumable: Consumable;
    warehouse: Warehouse;
    consignor: any | null; // Change 'any' to the actual type if known
}
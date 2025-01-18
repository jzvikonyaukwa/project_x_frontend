export interface InventoryBalance {
    stockBalance: number;
    transactionQuantity: number;
    transactionDate: Date;
    referenceID?: number;
    unitCost: number;
    transactionValue: number;
    transactionType: "GRV" | "INVOICE" | "BALANCE" | "BALANCE B/F";
}
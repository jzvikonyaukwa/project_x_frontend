export interface ConsumableInterBranchTransferDetails {
  // Shared Attributes
  interBranchTransferId: number;
  dateTransferred: Date;
  qtyTransferred: number;

  // ConsumableInWarehouseFrom
  consumableInWarehouseFromId: number;
  consumableInWarehouseFromAvgLandedPrice: number;
  consumableInWarehouseFromQty: number;

  // ConsumableInWarehouseTo
  consumableInWarehouseToId: number;
  consumableInWarehouseToAvgLandedPrice: number;
  consumableInWarehouseToQty: number;

  // Consumable
  consumableId: number;
  consumableName: string;
  serialNumber: string;
}

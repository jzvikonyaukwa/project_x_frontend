export interface ConsumableDetailsDTO {
  consumableId?: number;
  consumableInWarehouseId: number;
  serialNumber: number;
  name: string;
  avgLandedPrice: number;
  uom: string;
  qty: number;
  minAlertQty: number;
  warehouseName: string;
  category: string;
  sourceCountry: string;
}

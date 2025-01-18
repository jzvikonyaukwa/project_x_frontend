export interface GRVPaginatedDetailsDTO {
  grvId: number;
  dateReceived: string;
  grvComments: string | null;
  supplierGrvCode: string;
  supplierName: string;
  purchaseOrderId: number;
  details: GRVPaginatedDetail[];
}

export interface GRVPaginatedDetail {
  finish: string | null;
  uom: string | null;
  width: number | null;
  gauge: number | null;
  color: string | null;
  coating: string | null;
  grvId: number;
  status: string | null;
  serialNumber: string | null;
  consumableId: number | null;
  dateReceived: string;
  supplierGrvCode: string;
  purchaseOrderId: number;
  coilNumber: string | null;
  weightInKgsOnArrival: number | null;
  cardNumber: string | null;
  landedCostPerMtr: number | null;
  landedCostPerKg: number | null;
  qtyOrdered: number | null;
  avgLandedPrice: number | null;
  steelCoilId: number | null;
  isqGrade: string | null;
  consumableOnGrvId: number | null;
  consumableInWarehouseId: number | null;
  steelCoilWarehouseId: number | null;
  consumableWarehouseId: number | null;
  steelCoilSupplierId: number | null;
  consumableSupplierId: number | null;
  consumableWarehouse: string | null;
  consumableName: string | null;
  consumableCategoryId: number | null;
  steelCoilWarehouse: string | null;
  consumableSupplierName: string | null;
  steelCoilSupplierName: string | null;
  estimatedMetersRemaining: number | null;
  estimatedMeterRunOnArrival: number | null;
}

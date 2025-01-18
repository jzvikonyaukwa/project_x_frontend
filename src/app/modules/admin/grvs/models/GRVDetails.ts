export interface GRVDetails {
  // GRV related fields
  grvId: number;
  dateReceived: Date;
  grvComments: string;
  grvPaidStatus: boolean;
  grvTotal: number;
  supplierGrvCode: string;

  // Steel Coil Supplier related fields
  steelCoilSupplierId: string;
  steelCoilSupplierName: string;

  status: string;

  weightInKgsOnArrival: number;
  estimatedMetersRemaining: number;
  landedCostPerMtr: number;
  isqGrade: string;

  steelCoilId: number;
  coilNumber: string;
  cardNumber: string;
  coating: string;
  color: string;
  finish: string;
  gauge: number;
  width: number;
  estimatedMeterRunOnArrival: number;
  steelCoilWarehouseId: number;
  steelCoilWarehouse: string;

  // Consumable related fields
  consumableId: string;
  serialNumber: string;
  consumableName: string;
  // consumableUnitPrice: number;
  consumableUOM: string;
  consumableSourceCountryId: string;
  qtyOrdered: number;
  avgLandedPrice: number;

  // Consumable Category related fields
  consumableCategoryId: string;

  // Consumable Supplier related fields
  consumableSupplierId: string;
  consumableSupplierName: string;

  // Consumable Warehouse related fields
  consumableWarehouseId: string;
  consumableWarehouse: string;

  //Purchase Order Id
  purchaseOrderId: number;
}

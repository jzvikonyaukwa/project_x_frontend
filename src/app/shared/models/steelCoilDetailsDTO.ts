export interface SteelCoilDetailsDTO {
  steelCoilId: number;
  coilNumber: string;
  cardNumber: string;
  cssColor: string;
  weightInKgsArrival: number;
  estMtrsOnArrival?: number;
  estMtrsRemaining: number;
  landedCostPerMtr: number;
  isqGrade: string;
  gauge: number;
  width: number;
  coating: string;
  color: string;
  loadedTime?: Date;
  cutsMade?: number;
  totalMetersCut?: number;
  supplierName?: string;
  finish: string;
  dateReceived: Date;
  warehouse?: string;
  consignor?: string;
  grvId?: number;
}

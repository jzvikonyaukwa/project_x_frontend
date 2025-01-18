import { Warehouse } from 'app/modules/admin/warehouses/warehouse';
import { Color } from './color';
import { Gauge } from './gauge';
import { Width } from './width';
import { Consignor } from 'app/modules/admin/consignors/models/consignor';

export interface SteelCoilPostDTO {
  productOnPurchaseOrderId: number;
  steelCoilId?: number;
  coilNumber: string;
  cardNumber?: string;
  status: string;
  isqGrade: string;
  coating: string;
  weightInKgsOnArrival?: number;
  estimatedMeterRunOnArrival?: number;
  estimatedMetersRemaining?: number;
  purchaseCostPerKg: number;
  landedCostPerKg: number;
  landedCostPerMtr?: number;
  color: Color;
  width: Width;
  gauge: Gauge;
  warehouse: Warehouse;
  consignor: Consignor;
  weightOrdered?: number;
}

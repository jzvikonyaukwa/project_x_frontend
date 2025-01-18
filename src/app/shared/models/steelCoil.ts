import { Warehouse } from 'app/modules/admin/warehouses/warehouse';
import { Color } from './color';
import { Gauge } from './gauge';
import { Width } from './width';
import { Consignor } from 'app/modules/admin/consignors/models/consignor';
import { SteelSpecification } from './steelSpecification';

export interface SteelCoil {
  id?: number;
  coilNumber: string;
  cardNumber?: string;
  status: string;
  finish: string;
  steelSpecificationId: number;
  coating: string;
  color: Color;
  width: Width;
  gauge: Gauge;
  warehouse: Warehouse;
  consignor: Consignor;
  isqGrade: string;
  estimatedMeterRunOnArrival?: number;
  estimatedMetersRemaining?: number;
  landedCostPerKg: number;
  landedCostPerMtr?: number;
  steelSpecification?: SteelSpecification;
  weightInKgsOnArrival?: number;
}

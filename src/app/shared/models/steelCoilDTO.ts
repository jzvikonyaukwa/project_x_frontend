export interface SteelCoil {
  id: number;
  coildId: string;
  cardNumber: string;
  estMtrRunOnArrival: number;
  weightInKgsOnArrival: number;
  estMtrRemaining: number;
  costPerKg: number;
  status: string;
  grvId: number;
  dateReceived: Date;
  steelSpecificationId: number;
  warehouseId: number;
}

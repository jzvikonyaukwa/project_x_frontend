export interface ConsignorSteelCoil {
    color: string;
    gauge: number;
    width: number;
    coilNumber: string;
    coating: string;
    finish: string;
    isqGrade: string;
    estMtrsRemaining: number;
    estMtrsOnArrival: number;
    cssColor: string;
    supplierName: string;
    dateReceived: Date | null;
    steelCoilId: number;
    cardNumber: string;
    weightInKgsOnArrival: number | null;
    landedCostPerMtr: number | null;
    consignor: string;
}
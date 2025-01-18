export interface ConsumableSummaryDTO {
    consumableName: string;
    count: number;
}

export interface SteelCoilSummaryDTO {
    steelSpecification: string;
    count: number;
}

export  interface  MonthlyOrderSummaryDTO{
    month: number;
    steelCoilsCount: number;
    consumablesCount: number;
}

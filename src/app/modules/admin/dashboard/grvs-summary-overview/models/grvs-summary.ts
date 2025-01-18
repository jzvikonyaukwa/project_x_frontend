//TODO: These can be refactored, same with backend models.
export interface ConsumableSummaryDetailsDTO {
    consumableName: string;
    consumableType: string;
    count: number;
}

export interface SteelCoilSummaryDetailsDTO {
    steelCoilSpecification: string;
    count: number;
}

export  interface  MonthlyOrderSummaryDTO{
    month: number;
    steelCoilsCount: number;
    consumablesCount: number;
}
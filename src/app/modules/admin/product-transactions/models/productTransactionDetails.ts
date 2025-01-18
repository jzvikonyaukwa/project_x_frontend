export interface ProductTransactionDetails {
    id: number;
    date: Date;
    manufacturedProductId: number;
    manufacturedProductCode: string;
    frameName: string;
    length: number;
    steelCoilId: number;
    coilNumber: string;
    wastageId: number;
    mtrsWasted: number;
    stockOnHandId: number;
    stockOnHandLength: number;
    steelCoilWidth: number,
    gauge: number,
    color: string,
    productType:string,


}

export interface ProductTransactionGridData {
    id: number;
    date: String;
    type: string;
    steelCoilId: number;
    coilNumber: string;
    productId: number;
    productLength: number;
    steelCoilWidth: number,
    gauge: number,
    color: string,
    productType:string,
}

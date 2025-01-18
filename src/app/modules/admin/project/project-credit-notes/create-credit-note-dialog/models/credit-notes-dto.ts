import {ReturnedProductsDto} from "./returned-products-dto";


export interface CreditNotesDto {
    id?: number;
    dateCreated:Date;
    deliveryNoteId: number;
    quoteId: number;
    projectId:number;
    returnedProducts: ReturnedProductsDto[];

}

export interface CreditNoteDetailsDto {
    creditNoteId: number;
    dateCreated: string;
    returnedProductId: number;
    returnedProductReason: string;
    returnedProductDate: string;
    inventoryId: number;
    inventoryDateIn: string;
    inventoryDateOut: string;
    manufacturedProductId: number;
    manufacturedProductCode: string;
    manufacturedProductFrameName: string;
    manufacturedProductLength: number;
    manufacturedProductStickType: string;
    manufacturedProductFrameType: string;
    manufacturedProductStatus: string;
    manufacturedProductPricePerMeter: number;

    // Fields for consumables
    consumableOnQuoteId: number;
    consumableOnQuoteQty: number;
    consumableOnQuoteUnitPrice: number;
    frameName: string;
    frameType: string;
}



import { ProductTransaction } from '../product-transactions/models/productTransaction';

export interface AggregatedProduct {
  id?: number;
  stick: string;
  stickType: string;
  code: string;
  length: number;
  status: string;
  productTransaction?: ProductTransaction;
}

export interface AggregatedPastedProduct {
  id?: number;
  stick: string;
  stickType: string;
  code: string;
  length: number;
  status: string;
  frameName:string;
  frameType:string;
  planName:string;
}


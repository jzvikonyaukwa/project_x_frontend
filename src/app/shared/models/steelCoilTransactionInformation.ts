import { ManufacturedProduct } from "../../modules/admin/cutting-lists/models/manufacturedProduct";

export class SteelCoilTransactionInformation {
  date: Date;
  planName: string;
  frameType: string;
  frameName: string;
  manufacturedProductId: number;
  client: string;
  code: string;
  productTransactionId: number;
  stockOnHandId: number;
  stockOnHandLength: number;
  wastageId: number;
  wastageLength: number;
  manufacturedProductLength: number;
  quoteId: number;
}

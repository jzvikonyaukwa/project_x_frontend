import { ProductDTO } from './productDTO';

export interface ProductInformation {
  clientName: string;
  projectName: string;
  quoteStatus: string;
  quoteAcceptedDate: Date;
  // finish: string;
  // color: string;
  // cssColor: string;
  // gauge: number;
  // pricePerMeter: number;
  product: ProductDTO;
}

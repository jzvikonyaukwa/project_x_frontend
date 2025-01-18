import { QuoteStatus } from '@shared/enums/quote-status';
import { ProductDTO } from '@shared/models/productDTO';

export class MachinesCuttingListsDTO {
  clientName: string;
  profile: string;
  finish: string;
  quoteStatus: QuoteStatus;
  quoteAcceptedDate: Date;
  quoteDateIssued: Date;
  cuttingList: ProductDTO;
  quoteDateLastModified: Date;
}

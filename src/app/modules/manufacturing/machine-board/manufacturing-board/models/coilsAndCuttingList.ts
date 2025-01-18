import { ProductInformation } from "app/modules/admin/cutting-lists/models/cuttingListInformationDTO";
import { SteelCoilDetailsDTO } from "@shared/models/steelCoilDetailsDTO";

export interface CoilAndCuttingList {
  color: string;
  gauge: number;
  totalMeteres: number;
  cuttingLists: ProductInformation[];
  // inProgressCuttingList: CuttingListInformation;
  recommendedCoil: SteelCoilDetailsDTO;
  steelCoils: SteelCoilDetailsDTO[];
}

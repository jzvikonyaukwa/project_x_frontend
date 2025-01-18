import { ProductInformation } from "app/modules/admin/cutting-lists/models/cuttingListInformationDTO";
import { SteelCoilDetailsDTO } from "@shared/models/steelCoilDetailsDTO";

export interface ManufacturingColumn {
  loadedCoil: SteelCoilDetailsDTO;
  inProgressCuttingList: ProductInformation;
  matchingCuttingLists: ProductInformation[];
  matchingCoils: SteelCoilDetailsDTO[];
}

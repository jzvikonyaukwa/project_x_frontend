import { InventoryItemDTO } from "../../../../inventory/models/inventoryItemDTO";

export interface GroupMPs {
  quoteId: number;
  cuttingListId: number;
  frameType: string;
  frameName: string;
  totalItems: number;
  totalLengthOrQty: number;
  groupedInventoryItemDTO: InventoryItemDTO[];
}

import { InventoryItemDTO } from 'app/modules/admin/inventory/models/inventoryItemDTO';

export interface GroupMPs {
  quoteId: number;
  product: string;
  frameName: string;
  totalItems: number;
  totalLengthOrQty: number;
  quantityToDeliver?: number;
  groupedInventoryItemDTO: InventoryItemDTO[];
}

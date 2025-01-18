import { InventoryItem } from '../../inventory/models/inventoryItem';

export interface GroupedItems {
  name: string;
  description?: string;
  totalItems: number;
  totalLengthOrQty: number;
  groupedInventoryItemDTO: InventoryItem[];
}

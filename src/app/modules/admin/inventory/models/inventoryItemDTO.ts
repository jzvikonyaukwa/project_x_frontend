export interface InventoryItemDTO {
  // INVENTORY ITEM
  inventoryId: number;
  projectName: string;
  clientName: string;
  dateIn: string;
  dateOut: string;
  deliveryNoteId: number;
  quoteId: number;

  // String
  itemType: string;

  // PRODUCT
  productId: number;
  productName: string;
  productStatus: string;
  totalProductLength: number;
  numberOfAggregatedProducts: number;
  frameName: string;
  frameType: string;

  // CONSUMABLE
  consumableOnQuoteId: number;
  consumableName: string;
  totalItems?: number;
  quantityToDeliver?: number;
  numberOfConsumables?: number;
}

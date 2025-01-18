export interface DeliverNoteDTO {
  id?: number;
  dateCreated: Date;
  dateDelivered: string;
  deliveryAddress: string;
  projectId: number;
  consumablesIdsQuantities: Array<{ [key: number]: number }>;
  manufacturedProductsID: number[];
  removeConsumablesOnQuoteID?: number[];  // Optional property for removal
  removeManufacturedProductsID?: number[];  // Optional property for removal
}

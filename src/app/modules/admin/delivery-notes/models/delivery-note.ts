import { InventoryItem } from "../../inventory/models/inventoryItem";
import { Project } from "../../projects/models/project";

interface Status {
  OUT_FOR_DELIVERY: string;
  PENDING_DELIVERY: string;
}

export interface DeliveryNote {
  id?: number;
  dateCreated: Date;
  dateDelivered: string;
  deliveryAddress: string;
  status: Status;
  project: Project;
  inventories: InventoryItem[];
}

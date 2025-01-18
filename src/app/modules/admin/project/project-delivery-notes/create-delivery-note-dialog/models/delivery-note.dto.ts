import { InventoryItemDTO } from 'app/modules/admin/inventory/models/inventoryItemDTO';

export interface DeliveryNoteDTO {
  id: number;
  dateCreated: string;
  dateDelivered: string;
  deliveryAddress: string;
  status: string;
  inventories: InventoryItemDTO[];
}

// {
//     "id": 129,
//     "dateCreated": "2024-12-12",
//     "dateDelivered": "2024-12-12",
//     "deliveryAddress": "3 Main Road",
//     "status": "DELIVERED",
//     "inventories": [
//     {
//     "id": 537975,
//     "dateIn": "2024-12-12",
//     "dateOut": "2024-12-12",
//     "consumable": null,
//     "product": {
//     "id": 537975,
//     "code": "P",
//     "frameName": "PR-01",
//     "totalLength": 12,
//     "frameType": "PR-01",
//     "productName": "Purlins",
//     "status": "0",
//     "quantity": 1
//     }
//     }
//     ]
//     },

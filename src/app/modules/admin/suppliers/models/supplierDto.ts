import { UserDTO } from "app/modules/admin/clients/user-form/models/userDTO";

export interface SupplierDto extends UserDTO {
  id: number;
}

export interface SupplierWithDetailsDTO {
  supplierId: number;
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierStreet: string;
  supplierSuburb: string;
  supplierCity: string;
  supplierCountry: string;
}

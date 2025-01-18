import {
  Address,
  Email,
  Phone,
} from "app/modules/admin/clients/user-form/models/userDTO";

export interface Client {
  id: number;
  name: string;
  notes: string;
  addresses: Address[];
  phones: Phone[];
  emails: Email[];
}

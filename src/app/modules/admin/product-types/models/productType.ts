import { Machine } from "app/modules/manufacturing/machines/models/machine";

export interface ProductType {
  id?: number;
  name: string;
  width: number;
  outsourced: boolean;
  machine: Machine;
}

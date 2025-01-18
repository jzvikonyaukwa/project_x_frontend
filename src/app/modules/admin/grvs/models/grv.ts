import { SteelCoil } from "../../../../shared/models/steelCoil";

export interface Grv {
  id: number;
  dateReceived: Date;
  comments?: string | null;
  supplierGrvCode: string;
  supplierId: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface GrvTotal {
  id: number;
  dateReceived: string;
  grvTotal: number;
}

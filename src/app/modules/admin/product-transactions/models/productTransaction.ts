import { ManufacturedProduct } from "../../cutting-lists/models/manufacturedProduct";

export interface ProductTransaction {
    id: number;
    date: string;
    stockProduct: null;
    manufacturedProduct: ManufacturedProduct;
    wastage: null;
}
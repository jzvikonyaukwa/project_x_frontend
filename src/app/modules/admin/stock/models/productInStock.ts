import { ProductType } from '../../product-types/models/productType';

export interface ProductInStock {
  id: number;
  length: number;
  productType: ProductType;
}

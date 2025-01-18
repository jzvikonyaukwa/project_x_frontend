import { Gauge } from '@shared/models/gauge';
import { Color } from '@shared/models/color';
import { Width } from '@shared/models/width';
import { Profile } from '@shared/models/profile';
import { ProductType } from '../../../../product-types/models/productType';
import { ProductLengthQuantityDTO } from './productLengthQuantityDTO';

export interface CreateProductDTO {
  id?: number;
  targetDate: Date;
  gauge: Gauge;
  color: Color;
  width: Width;
  profile: Profile;
  code: string;
  productType: ProductType;
  frameType: string;
  frameName: string;
  totalLength: number;
  totalQuantity: number;
  //todo - To change This
  costPrice?:number;
  sellPrice?:number;
  aggregatedProducts?: ProductLengthQuantityDTO[];
}

import { ProductStatus } from '@shared/enums/product-status';
import { Profile } from '@shared/models/profile';
import { ProductPrice } from './productPrice';
import { Gauge } from '@shared/models/gauge';
import { Color } from '@shared/models/color';
import { Width } from '@shared/models/width';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { ProductType } from '../../product-types/models/productType';

export interface ProductDTO {
  id?: number;
  status: ProductStatus;
  dateWorkBegan?: Date | null;
  dateWorkCompleted?: Date | null;
  lastWorkedOn?: Date | null;
  targetDate: Date | null;
  priority: string;
  planName: string;
  productType?: ProductType;
  gauge: Gauge;
  color: Color;
  width: Width;
  canInvoice: boolean;
  profile?: Profile;
  invoiceId?: number;
  productPrice?: ProductPrice;
  frameName?: string;
  frameType?: string;
  totalLength?: number;
  totalQuantity?: number;
  sellPrice?:number;
  costPrice?:number;
  aggregatedProducts: AggregatedProduct[];
  completionPercentage?: number[];
}

import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';
import { Width } from '@shared/models/width';
import { Color } from '@shared/models/color';
import { Gauge } from '@shared/models/gauge';
import { Profile } from '@shared/models/profile';
import { ProductDTO } from '../../cutting-lists/models/productDTO';

export interface InventoryItem {
  id: number;
  dateIn: Date;
  dateOut: Date;
  product?: ProductDTO;
  consumable?: ConsumableOnQuote;
  deliveryNoteId?: number;
  color?: Color;
  width?: Width;
  gauge?: Gauge;
  profile?: Profile;
}

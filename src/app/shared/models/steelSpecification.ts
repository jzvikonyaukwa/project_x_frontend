import { Color } from "@shared/models/color";
import { Finish } from "@shared/models/finish";
import { Gauge } from "@shared/models/gauge";
import { Width } from "@shared/models/width";
import { Grv } from "../../modules/admin/grvs/models/grv";

export interface SteelSpecification {
  id?: number;
  coating: string;
  color: Color;
  width: Width;
  gauge: Gauge;
  isqgrade?: string;
  grv?: Grv;
}

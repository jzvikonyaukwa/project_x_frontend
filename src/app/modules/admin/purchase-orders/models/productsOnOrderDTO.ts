import { SteelCoilPostDTO } from "@shared/models/steelCoilPostDTO";

export interface ProductsOnOrderDTO {
  steelSpecification: SteelCoilPostDTO;
  qty: number;
}

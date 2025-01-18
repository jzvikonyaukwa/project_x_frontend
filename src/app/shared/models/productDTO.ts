import {Finish} from "@shared/models/finish";
import {Price} from "@shared/models/price";

export interface ProductDTO {
    id: number;
    finish: Finish;
    price: Price;
}
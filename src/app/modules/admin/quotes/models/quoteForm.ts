import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { QuoteStatus } from "@shared/enums/quote-status";
import { ProductColors } from "@shared/enums/product-colors";
import { Gauges } from "@shared/enums/gauges";
import { ProductType } from "@shared/models/productType";

export interface QuoteForm {
  dateIssued: FormControl<string>;
  status: FormControl<QuoteStatus>;
  clientId: FormControl<number>;
  productType: FormControl<ProductType>;
}

export interface ProductForm {
  notes: FormControl<string>;
  profile: FormControl<string>;
  description: FormControl<string>;
  manufacturingProductId: FormControl<number>;
  color: FormControl<ProductColors | null>;
  gauge: FormControl<Gauges | null>;
  sheets: FormArray<FormGroup<SheetForm>>;
}

export interface SheetForm {
  sheetCode: FormControl<string>;
  length: FormControl<number>;
  amountOfSheets: FormControl<number>;
}

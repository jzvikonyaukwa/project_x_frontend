import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { forkJoin, Subject, takeUntil, finalize, tap } from 'rxjs';

// Models
import { ProductType } from '../../../product-types/models/productType';
import { CreateProductDTO } from './models/createProductDTO';
import { Quote } from '../../models/quote';

// Services
import { ProductTypesService } from '../../../product-types/services/product-types.service';
import { QuotesService } from '../../services/quotes.service';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';

// Custom Components
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { Finish } from '@shared/models/finish';
import { Gauge } from '@shared/models/gauge';
import { Profile } from '@shared/models/profile';
import { Width } from '@shared/models/width';
import { ColorsService } from '@shared/services/colors.service';
import { FinishesService } from '@shared/services/finishes.service';
import { GaugesService } from '@shared/services/gauges.service';
import { ProfilesService } from '@shared/services/profiles.service';
import { WidthService } from '@shared/services/width.service';
import { ProductLengthQuantityDTO } from './models/productLengthQuantityDTO';
import { Color } from '@shared/models/color';
import { ProductService } from '../../../product/product.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    PageHeadingComponent,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatRadioModule,
    MatCardModule,
  ],
  templateUrl: './add-product.component.html',
})
export class AddProductComponent implements OnInit, OnDestroy {
  private dataLoaded = new Subject<void>();

  productForm: FormGroup;
  gauges: Gauge[] = [];
  widths: Width[] = [];
  colors: Color[] = [];
  profiles: Profile[] = [];
  finishes: Finish[] = [];
  productTypes: ProductType[] = [];
  productType: ProductType | null = null;
  selectedColor: Color | null = null;
  isRoofSheet = false;

  usersColorsChoice: Color[];
  private colorEnabledProductTypes = ['Cranked Ridges', 'Roll Top Ridges', 'Flashing'];

  private ngUnsubscribe = new Subject<void>();
  private quote: Quote;

  public costPrice: number;
  public sellPrice: number = 0;

  constructor(
    private dialogRef: MatDialogRef<AddProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { edit?: boolean; rowData?: CreateProductDTO },
    private fb: FormBuilder,
    private productTypesService: ProductTypesService,
    private widthService: WidthService,
    private gaugesService: GaugesService,
    private colorsService: ColorsService,
    private profilesService: ProfilesService,
    private finishesService: FinishesService,
    private quoteService: QuotesService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();

    // Delay setup until data is loaded
    this.dataLoaded.subscribe(() => {
      this.setupFormListeners();
      if (this.data.edit) this.populateForm();
    });

    const defaultMarkup = this.quote?.quotePrice?.markUp || 0;
    this.productForm.patchValue({ markUp: defaultMarkup });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  quote$ = this.quoteService.currentQuote$
    .pipe(
      takeUntil(this.ngUnsubscribe),
      tap((quote) => {
        this.quote = quote;
      }),
    )
    .subscribe(() => {});

  private initializeForm(): void {
    this.productForm = this.fb.group({
      productType: ['', Validators.required],
      targetDate: [new Date(), Validators.required],
      width: ['', Validators.required],
      gauge: ['', Validators.required],
      profile: [null],
      finish: ['', Validators.required],
      color: [null, Validators.required],
      frameName: [''],
      frameType: [''],
      aggregatedProducts: this.fb.array([]),
      costPrice: [0],
      sellPrice: [0, Validators.required],
      markUp: [{ value: 0, disabled: true }],
    });
  }

  private loadInitialData(): void {
    forkJoin([
      this.colorsService.getAllColors(),
      this.gaugesService.getAllGauges(),
      this.widthService.getAllWidths(),
      this.profilesService.getAllProfiles(),
      this.productTypesService.getAllProductTypes(),
    ])
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.getFinishes();
          this.dataLoaded.next();
          this.dataLoaded.complete();
        }),
      )
      .subscribe(([colors, gauges, widths, profiles, productTypes]) => {
        this.colors = colors || [];
        this.gauges = gauges || [];
        this.widths = widths || [];
        this.profiles = profiles || [];
        this.productTypes = productTypes || [];
      });
  }

  private setupFormListeners(): void {
    this.productForm.valueChanges.subscribe(() => {
      const gauge = this.productForm.get('gauge')?.value;
      const width = this.productForm.get('width')?.value;
      const color = this.productForm.get('color')?.value;
      const markup = this.productForm.get('markUp')?.value || 0;

      // Fetch the cost price dynamically
      if (gauge && width && color) {
        this.getAndSetCostPrice(color, gauge, width, markup);
      }
    });

    this.productForm.get('productType')?.valueChanges.subscribe((type) => {
      this.productType = type;
      this.isRoofSheet = type?.name === 'Roof Sheet';

      let selectedGauge: Gauge;

      if (this.productType.name === 'Roof Sheet') {
        selectedGauge = this.gauges.find((g) => g.gauge === 0.4)!;
        this.productForm.get('profile').setValue(this.profiles[0]);
      } else if (['Purlins', 'Battens'].includes(this.productType.name)) {
        selectedGauge = this.gauges.find((g) => g.gauge === 0.55)!;
        this.productForm.get('profile').setValue(null);
      } else if (['Valley Gutters', 'Flashing'].includes(this.productType.name)) {
        selectedGauge = this.gauges.find((g) => g.gauge === 0.4)!;
        this.productForm.get('profile').setValue(null);
      } else {
        selectedGauge = this.gauges.find((g) => g.gauge === 0.8)!;
        this.productForm.get('profile').setValue(null);
      }

      if (this.isColorSelectionEnabled(type)) {
        this.usersColorsChoice = this.colors.filter((color) => color.finish);
        selectedGauge = this.gauges.find((g) => g.gauge === 0.4)!;
        this.productForm.get('profile').setValue(this.profiles[0]);
      }

      this.productForm.patchValue({
        gauge: selectedGauge,
        width: this.getWidthForProduct(),
        color: this.getColorForProduct(),
        finish: this.getFinishForProduct(),
      });

      this.adjustFormForProductType();
    });

    this.productForm.get('finish')?.valueChanges.subscribe((finishId) => {
      this.filterColorsByFinish(finishId);
    });
  }

  getAndSetCostPrice(color: Color, gauge: Gauge, width: Width, markup: number): void {
    this.productService.getAveragePriceForProduct(color.id, gauge.id, width.id).subscribe({
      next: (price) => {
        this.costPrice = price;

        this.sellPrice = this.costPrice * markup;

        if (
          this.productForm.get('sellPrice')?.pristine || // Only update if untouched
          !this.productForm.get('sellPrice')?.value // Or sellPrice is undefined
        ) {
          this.productForm.patchValue(
            { sellPrice: this.sellPrice.toFixed(2) },
            { emitEvent: false },
          );
        }
      },
      error: (err) => {
        console.error('Error fetching cost price:', err);
      },
    });
  }

  isColorSelectionEnabled(productType: ProductType): boolean {
    return productType && this.colorEnabledProductTypes.includes(productType.name);
  }

  private getWidthForProduct(): Width {
    const width =
      this.productType.name === 'Roof Sheet'
        ? 925
        : this.productType.name === 'Purlins'
        ? 150
        : this.productType.name === 'Battens'
        ? 103
        : ['Roll Top Ridges', 'Valley Gutters', 'Flashing', 'Cranked Ridges'].includes(
            this.productType.name,
          )
        ? 925
        : 182;

    const foundWidth = this.widths.find((w) => w.width === width);

    if (!foundWidth) {
      console.error(`No width found for value ${width}`);
      throw new Error(`No width found for value ${width}`);
    }

    return foundWidth;
  }

  getColorForProduct(): Color {
    if (this.productType.name != 'Roof Sheet')
      return this.colors.find((color) => color.color === 'Galvanize');
  }

  getFinishForProduct(): Finish {
    if (this.productType.name != 'Roof Sheet') return this.finishes[1];
  }

  private populateForm(): void {
    if (!this.data.rowData) return;
    const { productType, targetDate, width, gauge, profile, frameName, frameType, color } =
      this.data.rowData;

    this.productForm.patchValue({
      productType,
      targetDate,
      width,
      gauge,
      profile,
      frameName,
      frameType,
      color,
      finish: this.data.rowData.color.finish.id,
    });

    this.populateAggregatedProducts(this.data.rowData.aggregatedProducts || [], productType);
  }

  private getFinishes(): void {
    this.finishesService
      .getAllFinishes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((finishes) => {
        this.finishes = finishes || [];
      });
  }

  private filterColorsByFinish(finishId: number): void {
    if (finishId && this.colors && this.colors.length > 0) {
      this.usersColorsChoice = this.colors.filter((color) => color.finish?.id === finishId);
    } else {
      console.warn('Colors array is not initialized or empty.');
      this.usersColorsChoice = [];
    }
    console.log('User choice:', this.usersColorsChoice);
  }

  private adjustFormForProductType(): void {
    this.clearAggregatedProducts();
    this.isRoofSheet ? this.addSheetProductRow() : this.addOtherProductRow();
  }

  public addItem(): void {
    this.isRoofSheet ? this.addSheetProductRow() : this.addOtherProductRow();
  }

  private addSheetProductRow(): void {
    this.aggregatedProducts.push(
      this.fb.group({ length: ['', Validators.required], quantity: ['', Validators.required] }),
    );
  }

  private addOtherProductRow(): void {
    this.aggregatedProducts.push(this.fb.group({ length: ['', Validators.required] }));
  }

  private clearAggregatedProducts(): void {
    this.aggregatedProducts.clear();
  }

  public removeItem(index: number): void {
    this.aggregatedProducts.removeAt(index);
  }

  private populateAggregatedProducts(
    products: ProductLengthQuantityDTO[],
    productType: ProductType,
  ): void {
    this.clearAggregatedProducts();

    if (productType.name === 'Purlins' || productType.name == 'Battens') {
      const totalLength = products.reduce((sum, product) => sum + product.length, 0);
      this.aggregatedProducts.push(
        this.fb.group({
          length: [totalLength, Validators.required],
          quantity: [1, Validators.required],
        }),
      );
    } else {
      products.forEach((product) =>
        this.aggregatedProducts.push(
          this.fb.group({
            length: [product.length, Validators.required],
            quantity: [product.quantity, Validators.required],
          }),
        ),
      );
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.logInvalidForm();
      return;
    }
    const productData: CreateProductDTO = this.productForm.value;

    console.log('productData', productData);
    if (this.isRoofSheet) {
      productData.frameName = 'Sheets';
      productData.frameType = 'Sheets';
      this.createSheetManufacturedProducts(productData);
    } else this.createOtherProducts(productData);

    if (this.data.edit && this.data.rowData && this.data.rowData.id)
      productData.id = this.data.rowData.id;

    this.dialogRef.close(productData);
  }

  createSheetManufacturedProducts(createProductDTO: CreateProductDTO): void {
    createProductDTO.code = this.productTypesService.getCodeFromClientsName(
      this.quote.project.client.name,
    );
    let totalLength = 0;
    let totalQuantity = 0;
    createProductDTO.aggregatedProducts = [];
    const manufacturedProductsArray = this.productForm.get('aggregatedProducts').value;
    if (manufacturedProductsArray && manufacturedProductsArray.length > 0) {
      manufacturedProductsArray.forEach((mp) => {
        const aggregatedProduct: ProductLengthQuantityDTO = {
          quantity: mp.quantity,
          length: mp.length,
        };
        createProductDTO.aggregatedProducts.push(aggregatedProduct);
        totalLength += Number(mp.length);
        totalQuantity += mp.quantity;
      });
      createProductDTO.totalLength = totalLength;
      createProductDTO.totalQuantity = totalQuantity;
    }
  }

  createOtherProducts(createProductDTO: CreateProductDTO): void {
    createProductDTO.code = this.productTypesService.getCodeFromClientsName(
      this.quote.project.client.name,
    );
    let totalLength = 0;
    let totalQuantity = 0;
    const manufacturedProductsArray = this.productForm.get('aggregatedProducts').value;
    if (manufacturedProductsArray && manufacturedProductsArray.length > 0) {
      manufacturedProductsArray.forEach((mp) => {
        totalLength += Number(mp.length);
        totalQuantity += 1;
      });
      createProductDTO.totalLength = totalLength;
      createProductDTO.totalQuantity = totalQuantity;
    }
  }

  logInvalidForm(): void {
    console.warn('Invalid form submission', this.productForm.errors);
    // Find and log the invalid controls
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      if (control && control.invalid) {
        console.log(`Invalid Field: ${key}`, control.errors);
      }
    });

    return;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get aggregatedProducts(): FormArray {
    return this.productForm.get('aggregatedProducts') as FormArray;
  }

  compareFn = (a: { id: any }, b: { id: any }): boolean => a && b && a.id === b.id;
}

interface ProductTypeConfig {
  gauge: number;
  profile: any | null;
  width: number;
}

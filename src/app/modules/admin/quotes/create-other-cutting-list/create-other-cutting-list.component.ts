import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { Gauge } from '@shared/models/gauge';
import { Width } from '@shared/models/width';
import { GaugesService } from '@shared/services/gauges.service';
import { WidthService } from '@shared/services/width.service';
import { finalize, forkJoin, Subject, takeUntil, tap } from 'rxjs';
import { Color } from '@shared/models/color';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { ProductStatus } from '@shared/enums/product-status';
import { ManufacturedProduct } from '../../cutting-lists/models/manufacturedProduct';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { CreateCuttingListService } from '../create-sheets-cutting-list/service/create-cutting-list.service';
import { QuotesService } from '../services/quotes.service';
import { Quote } from '../models/quote';
import { ColorsService } from '@shared/services/colors.service';
import { Profile } from '@shared/models/profile';

@Component({
  selector: 'app-create-other-cutting-list',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    CurrencyPipe,
    MatInputModule,
    MatRadioModule,
    PageHeadingComponent,
  ],
  templateUrl: './create-other-cutting-list.component.html',
})
export class CreateOtherCuttingListComponent implements OnInit, OnDestroy {
  PLAN_NAMES: string[];
  DEFAULT_GAUGE;

  gauges: Gauge[];
  gauge: Gauge;
  widths: Width[];
  color: Color;

  public cuttingListForm: FormGroup;

  private manufacturedProductForm: () => FormGroup = () =>
    this._fb.group({
      code: [null, [Validators.required]],
      frameName: [null, [Validators.required]],
      frameType: [null, [Validators.required]],
      totalLength: [null, Validators.required],
    });

  private ngUnsubscribe = new Subject<void>();

  quote: Quote;
  quote$ = this.quoteService.currentQuote$
    .pipe(
      takeUntil(this.ngUnsubscribe),
      tap((quote) => {
        this.quote = quote;
      }),
    )
    .subscribe(() => {});
  productDTO: ProductDTO;

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<CreateOtherCuttingListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { type: string; edit?: boolean; rowData?: any },
    private gaugesService: GaugesService,
    private widthService: WidthService,
    private createCuttingListService: CreateCuttingListService,
    private quoteService: QuotesService,
    private colorsService: ColorsService,
  ) {}

  ngOnInit(): void {
    this.setPlaneNames();
    this.initializeForm();
    this.loadData();
    this.setupFormListeners();
    this.getQuote();
  }
  setPlaneNames() {
    if (this.data.type === 'purlinAndBatten') {
      this.PLAN_NAMES = ['Purlins', 'Battens'];
    } else {
      this.PLAN_NAMES = ['Braces', 'Floor Joists', 'Roof Panels', 'Trusses', 'Wall Frames'];
    }
  }

  private initializeForm(): void {
    this.cuttingListForm = this._fb.group({
      planName: [this.PLAN_NAMES[0], Validators.required],
      targetDate: [new Date()],
      width: ['', Validators.required],
      gauge: [, Validators.required],
      notes: [''],
      manufacturedProducts: this._fb.array([], Validators.required),
    });
  }

  private loadData(): void {
    forkJoin({
      color: this.getColor(),
      gauges: this.getGauges(),
      widths: this.getWidths(),
    })
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          if (this.data.edit) {
            console.log('Filling edit form');
            this.fillEditForm();
          }
        }),
      )
      .subscribe(({ color, gauges, widths }) => {
        this.color = color;
        this.gauges = gauges;
        this.widths = widths;
        this.setDefaultGaugeOnLoad();
        this.setDefaultWidthOnLoad();
      });
  }

  fillEditForm(): void {
    this.productDTO = this.quote.products.find((q) => q.id === this.data.rowData.cuttingListId);

    const manufacturedProductsArray = this.cuttingListForm.get('manufacturedProducts') as FormArray;

    // const manufacturedProducts: ManufacturedProduct[] = this.productDTO.manufacturedProducts;

    // for (const mp of manufacturedProducts) {
    manufacturedProductsArray.push(
      this._fb.group({
        frameName: this.productDTO.frameName,
        frameType: this.productDTO.frameType,
        totalLength: this.productDTO.totalLength,
      }),
    );
    // }

    const color: Color = this.color;

    const gauge: Gauge = this.productDTO.gauge;

    this.cuttingListForm.patchValue({
      ...this.data.rowData,
      targetDate: new Date(this.productDTO.targetDate),
      gauge: gauge,
      profile: null,
      finish: color.finish.id,
      color: color,
      width: this.productDTO.width,
    });
  }

  private setupFormListeners(): void {
    this.cuttingListForm.get('planName').valueChanges.subscribe((planName: string) => {
      if (planName) {
        console.log('Plan name: ', planName);
        if (planName === 'Purlins') {
          this.cuttingListForm.get('gauge').setValue(this.getGauge(0.55));

          const widthForPurlin: Width = this.widthService.getWidthForPurlin(this.widths);
          this.cuttingListForm.get('width').setValue(widthForPurlin);
        } else if (planName === 'Battens') {
          this.cuttingListForm.get('gauge').setValue(this.getGauge(0.55));
          const widthForBatten: Width = this.widthService.getWidthForBatten(this.widths);

          this.cuttingListForm.get('width').setValue(widthForBatten);
        } else {
          console.log('Plan name not found');
          this.cuttingListForm.get('gauge').setValue(this.getGauge(0.8));
          const widthForBatten: Width = this.widthService.getWidthForFraemcad(this.widths);
          this.cuttingListForm.get('width').setValue(widthForBatten);
        }
      }
    });
  }

  public addManufacturedProduct(): void {
    (this.cuttingListForm.get('manufacturedProducts') as FormArray).push(
      this.manufacturedProductForm(),
    );
  }

  private getQuote() {
    this.quoteService.currentQuote$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((quote) => (this.quote = quote));
  }

  public deleteManufacturedProduct(index: number) {
    const manufacturedProducts = this.cuttingListForm.get('manufacturedProducts') as FormArray;
    manufacturedProducts.removeAt(index);
  }

  public get manufacturedProducts(): FormArray<FormGroup> {
    return this.cuttingListForm.get('manufacturedProducts') as FormArray;
  }

  private setDefaultGaugeOnLoad() {
    if (this.data.type === 'purlinAndBatten') {
      this.cuttingListForm.get('gauge').setValue(this.getGauge(0.55));
    } else {
      this.cuttingListForm.get('gauge').setValue(this.getGauge(0.8));
    }
  }

  private setDefaultWidthOnLoad() {
    if (this.data.type === 'purlinAndBatten') {
      const widthForPurlin: Width = this.widthService.getWidthForPurlin(this.widths);
      this.cuttingListForm.get('width').setValue(widthForPurlin);
    } else {
      const widthForFramecad: Width = this.widthService.getWidthForFraemcad(this.widths);
      this.cuttingListForm.get('width').setValue(widthForFramecad);
    }
  }

  getColor() {
    return this.colorsService.getGalvanizeColor();
  }

  getGauges() {
    return this.gaugesService.getAllGauges();
  }

  getWidths() {
    return this.widthService.getAllWidths();
  }

  getGauge(gauge: number): Gauge {
    return this.gauges.find((g) => g.gauge === gauge);
  }

  public onSubmit(): void {
    const planName = this.cuttingListForm.value.planName;
    console.log('Plan name: ++ ', planName);

    // Destructure and remove `manufacturedProducts` from form values
    const { manufacturedProducts, ...formValues } = this.cuttingListForm.value;
    // Construct the `ProductDTO` object explicitly
    const productDTO: ProductDTO = {
      // Required fields
      status: ProductStatus.SCHEDULED,
      canInvoice: true,
      aggregatedProducts: [],
      priority: 'normal',
      targetDate: formValues.targetDate || null, // Nullable field

      gauge: formValues.gauge as Gauge, // Ensure type matches
      color: this.color, // Ensure type matches
      width: formValues.width as Width, // Ensure type matches

      // Optional fields (set as needed)
      frameName: null,
      planName: planName || '', // Default empty string
      profile: formValues.profile as Profile, // Optional, cast if present
      lastWorkedOn: null, // Default for nullable field
      totalLength: formValues.totalLength || 0, // Default for optional number
      totalQuantity: formValues.totalQuantity || 0, // Default for optional number
    };

    if (this.data.edit) {
      productDTO.id = this.data.rowData.cuttingListId;
    }

    console.log('productDTO  DTO: ', productDTO);

    if (this.data.type === 'purlinAndBatten') {
      this.createManufacturedProductsForPandB(productDTO);
    } else {
      this.createManufacturedProductsForFramecad(productDTO);
    }

    this._dialogRef.close(productDTO);
  }

  createManufacturedProductsForFramecad(productDTO: ProductDTO) {
    const codeName = this.createCuttingListService.getCodeFromClientsName(
      this.quote.project.client.name,
    );

    console.log('Code name: ', codeName);

    const manufacturedProductsArray = this.cuttingListForm.get('manufacturedProducts').value;

    let index = 1;
    let totalLength = 0;
    let totalQuantity = 0;
    if (manufacturedProductsArray && manufacturedProductsArray.length > 0) {
      manufacturedProductsArray.forEach((mp) => {
        const manufacturedProduct: ManufacturedProduct = {
          frameName: mp.frameName + '-' + index,
          frameType: mp.frameType,
          status: 'scheduled',
          totalLength: mp.totalLength,
          totalQuantity: 1,
          aggregatedProducts: [],
        };

        const aggregatedProduct: AggregatedProduct = {
          stick: null,
          stickType: null,
          code: codeName + '-' + index,
          length: mp.totalLength,
          status: 'scheduled',
        };
        productDTO.aggregatedProducts.push(aggregatedProduct);
        totalLength += Number(mp.totalLength);
        totalQuantity += 1;
        productDTO.frameType = mp.frameType;
        productDTO.frameName = mp.frameName + '-' + index;

        index++;
      });
      productDTO.totalLength = totalLength;
      productDTO.totalQuantity = totalQuantity;
    }

    console.log('Cutting List DTO: ', productDTO);
  }

  createManufacturedProductsForPandB(productDTO: ProductDTO): void {
    const codeName = this.createCuttingListService.getCodeFromClientsName(
      this.quote.project.client.name,
    );

    const manufacturedProductsArray = this.cuttingListForm.get('manufacturedProducts').value;

    if (manufacturedProductsArray && manufacturedProductsArray.length > 0) {
      manufacturedProductsArray.forEach((mp) => {
        const numOfManufacturedProducts = Math.ceil(mp.totalLength / 6);
        const totalLength = numOfManufacturedProducts * 6;

        const manufacturedProduct: ManufacturedProduct = {
          frameName: mp.frameName,
          frameType: mp.frameType,
          status: 'scheduled',
          totalLength: totalLength,
          totalQuantity: numOfManufacturedProducts,
          aggregatedProducts: [],
        };

        for (let j = 0; j < numOfManufacturedProducts; j++) {
          const aggregatedProduct: AggregatedProduct = {
            stick: null,
            stickType: null,
            code: `${codeName}-${j}`,
            length: 6,
            status: 'scheduled',
          };
          productDTO.aggregatedProducts.push(aggregatedProduct);
          productDTO.frameType = mp.frameType;
          productDTO.frameName = mp.frameName;
        }
        productDTO.totalLength = totalLength;
        productDTO.totalQuantity = numOfManufacturedProducts;
      });
    } else {
      console.log('No manufactured products to process');
    }
  }

  compareFn<T extends { id: any }>(c1: T | null | undefined, c2: T | null | undefined): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  cancel() {
    console.log('cancel');
    this._dialogRef.close();
    this.cuttingListForm.reset();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, finalize, forkJoin, takeUntil, tap } from 'rxjs';
import { FinishesService } from '../../../../shared/services/finishes.service';
import { Gauge } from '@shared/models/gauge';
import { Color } from '@shared/models/color';
import { Finish } from '@shared/models/finish';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { PageHeadingComponent } from '@layout/common/page-heading/page-heading.component';
import { ColorsService } from '@shared/services/colors.service';
import { GaugesService } from '@shared/services/gauges.service';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { ProductStatus } from '@shared/enums/product-status';
import { ManufacturedProduct } from '../../cutting-lists/models/manufacturedProduct';
import { Quote } from '../models/quote';
import { QuotesService } from '../services/quotes.service';
import { ProfilesService } from '@shared/services/profiles.service';
import { Profile } from '@shared/models/profile';
import { Width } from '@shared/models/width';
import { WidthService } from '@shared/services/width.service';
import { CreateCuttingListService } from './service/create-cutting-list.service';
import { PLANNAMES } from '@shared/models/planNames';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { getFrameName } from '@shared/functions/get-frame-name';

@Component({
  selector: 'app-quote-form',
  templateUrl: './create-sheets-cutting-list.component.html',
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
})
export class CreateSheetsCuttingListComponent implements OnInit, OnDestroy {
  planNames: string[] = PLANNAMES;

  productDTO: ProductDTO;

  colors: Color[];
  usersColorsChoice: Color[];
  color: Color;
  finishes: Finish[];
  finish: Finish;
  displayGauges = true;
  gauges: Gauge[];
  gauge: Gauge;
  widths: Width[];
  profiles: Profile[];
  todaysDate: Date = new Date();
  frameType: string = '';

  public quoteForm: FormGroup = this._fb.group({
    planName: [null, [Validators.required]],
    finish: [null, [Validators.required]],
    profile: [null, [Validators.required]],
    targetDate: [new Date()],
    color: [null],
    gauge: ['', [Validators.required]],
    width: ['', [Validators.required]],
    notes: [''],
    manufacturedProducts: this._fb.array([], Validators.required),
  });

  private manufacturedProductForm: () => FormGroup = () =>
    this._fb.group({
      code: [null, [Validators.required]],
      length: [null, Validators.required],
      qty: [null, [Validators.required]],
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

  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _dialogRef: MatDialogRef<CreateSheetsCuttingListComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { type: string; edit?: boolean; rowData?: any },
    private finishesService: FinishesService,
    private colorsService: ColorsService,
    private gaugesService: GaugesService,
    private quoteService: QuotesService,
    private profileService: ProfilesService,
    private widthService: WidthService,
    private createCuttingListService: CreateCuttingListService,
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit');
    this.subscribeToPlanName();
    setTimeout(() => {
      this.quoteForm.get('planName')?.setValue('Purlins');
    }, 1000);
    this.subscribeToGauge();
    this.subscribeToFinish();
    this.subscribeToColor();
    this.getDataForCuttingList();
  }

  getDataForCuttingList(): void {
    forkJoin([this.getColors(), this.getGauges(), this.getWidths(), this.getProfiles()])
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.getAllFinishes();
          if (this.data.edit) {
            console.log('Filling edit form');
            this.fillEditForm();
          }
        }),
      )
      .subscribe(([colors, gauges, widths, profiles]: [Color[], Gauge[], Width[], Profile[]]) => {
        this.colors = colors;
        this.gauges = gauges;
        this.widths = widths;
        this.profiles = profiles;
      });
  }

  fillEditForm(): void {
    this.productDTO = this.quote.products.find((q) => q.id === this.data.rowData.cuttingListId);

    const manufacturedProductsArray = this.quoteForm.get('manufacturedProducts') as FormArray;

    manufacturedProductsArray.push(
      this._fb.group({
        frameName: this.productDTO.frameName,
        frameType: this.productDTO.frameType,
        length: this.productDTO.totalLength,
        qty: this.productDTO.totalQuantity,
      }),
    );

    let profile: Profile = null;
    if (this.productDTO && this.productDTO.profile) {
      profile = this.profiles.find((p: Profile) => p.profile === this.productDTO.profile.profile);
    }

    const color: Color = this.colors.find((c: Color) => c.color === this.productDTO.color.color);

    const gauge: Gauge = this.productDTO.gauge;

    this.quoteForm.patchValue({
      ...this.data.rowData,
      targetDate: new Date(this.productDTO.targetDate),
      gauge: gauge,
      profile: profile,
      finish: color.finish.id,
      color: color,
      width: this.productDTO.width,
    });
  }

  private getAllFinishes(): void {
    this.finishesService
      .getAllFinishes()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((finishes: Finish[]) => {
        this.finishes = finishes;

        console.log('this.data.type: ', this.data.type);

        if (this.data.type === 'Sheets') {
          console.log('Data type is Roof Sheets');

          this.quoteForm.get('planName').setValue(this.planNames[0]);

          const widthForSheet: Width = this.widthService.getWidthForSheet(this.widths);

          this.planNames = ['Roof Sheet'];
          this.frameType = 'Sheet';

          this.quoteForm.get('width').setValue(widthForSheet);
        } else if (this.data.type === 'purlinAndBatten') {
          console.log('Data type is Purlins or Battens');
          this.planNames = ['Purlins', 'Battens'];

          this.quoteForm.get('finish').setValue(this.finishes[1].id);
          this.quoteForm.get('color').setValue(this.colors[14]);
        } else {
          this.planNames = ['Braces', 'Floor Joists', 'Roof Panels', 'Trusses', 'Wall Frames'];
          console.log('Data type is framecad');
          this.quoteForm.get('finish').setValue(this.finishes[1].id);
          this.quoteForm.get('color').setValue(this.colors[14]);
        }
      });
  }

  private subscribeToPlanName(): void {
    this.quoteForm
      .get('planName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((planName: string) => {
        console.log('Plan name: ', planName);
        if (planName) {
          if (planName === 'Purlins') {
            this.quoteForm.get('gauge').setValue(this.getGauge(0.55));

            const widthForPurlin: Width = this.widthService.getWidthForPurlin(this.widths);
            this.quoteForm.get('width').setValue(widthForPurlin);
          }

          if (planName === 'Battens') {
            this.quoteForm.get('gauge').setValue(this.getGauge(0.55));
            const widthForBatten: Width = this.widthService.getWidthForBatten(this.widths);

            this.quoteForm.get('width').setValue(widthForBatten);
          }
        }
      });
  }

  getGauge(gauge: number): Gauge {
    return this.gauges.find((g) => g.gauge === gauge);
  }

  getColors() {
    return this.colorsService.getAllColors();
  }

  getGauges() {
    return this.gaugesService.getAllGauges();
  }

  getWidths() {
    return this.widthService.getAllWidths();
  }

  getProfiles() {
    return this.profileService.getAllProfiles();
  }

  private subscribeToGauge(): void {
    this.quoteForm.get('gauge').valueChanges.subscribe((gauge: Gauge) => {
      if (gauge) {
        console.log('Gauge selection change: ', gauge);
        this.gauge = gauge;
      }
    });
  }

  private subscribeToFinish(): void {
    this.quoteForm.get('finish').valueChanges.subscribe((finishId: number) => {
      if (finishId) {
        console.log('Finish selection change: ', finishId);

        this.usersColorsChoice = this.colors.filter((color) => color.finish.id === finishId);

        console.log('user choice = ', this.usersColorsChoice);
      }
    });
  }

  private subscribeToColor(): void {
    this.quoteForm.get('color').valueChanges.subscribe((color: Color) => {
      if (color) {
        this.color = color;
        console.log('Color selection change: ', color);
        this.displayGauges = true;
      }
    });
  }

  public addManufacturedProduct(): void {
    (this.quoteForm.get('manufacturedProducts') as FormArray).push(this.manufacturedProductForm());
  }

  public deleteManufacturedProduct(index: number) {
    const manufacturedProducts = this.quoteForm.get('manufacturedProducts') as FormArray;
    manufacturedProducts.removeAt(index);
  }

  public get manufacturedProducts(): FormArray<FormGroup> {
    return this.quoteForm.get('manufacturedProducts') as FormArray;
  }

  public onSubmit(): void {
    const planName = this.quoteForm.value.planName;
    console.log('Plan name: ', planName);
    const frameName = getFrameName(planName);
    console.log('Frame name: ', frameName);

    // Destructure and remove `manufacturedProducts` from form values
    const { manufacturedProducts, ...formValues } = this.quoteForm.value;
    // Construct the `ProductDTO` object explicitly
    const productDTO: ProductDTO = {
      // Required fields
      status: ProductStatus.SCHEDULED,
      canInvoice: true,
      aggregatedProducts: [],
      priority: 'normal',
      targetDate: formValues.targetDate || null, // Nullable field

      gauge: formValues.gauge as Gauge, // Ensure type matches
      color: formValues.color as Color, // Ensure type matches
      width: formValues.width as Width, // Ensure type matches

      // Optional fields (set as needed)
      frameName: frameName,
      planName: planName || '', // Default empty string
      profile: formValues.profile as Profile, // Optional, cast if present
      lastWorkedOn: null, // Default for nullable field
      totalLength: formValues.totalLength || 0, // Default for optional number
      totalQuantity: formValues.totalQuantity || 0, // Default for optional number
    };

    if (this.data.edit) {
      productDTO.id = this.data.rowData.cuttingListId;
    }

    // if (planName && planName === 'Sheets') {
    this.createSheetManufacturedProducts(productDTO, frameName, 'sheet');
    // }

    // else {
    //   console.log('In the else.');
    //   this.createSheetManufacturedProducts(cuttingListDTO, frameName, 'framecad');
    // }

    // if (this.quoteForm.value.manufacturedProducts.length === 0) {
    //   console.log('No manufactured products');
    //   return;
    // }

    console.log('Closing dialog: cuttingListDTO: ', productDTO);

    this._dialogRef.close(productDTO);
  }

  createSheetManufacturedProducts(
    productDTO: ProductDTO,
    frameType: string,
    frameName: string,
  ): void {
    const codeName = this.createCuttingListService.getCodeFromClientsName(
      this.quote.project.client.name,
    );

    const manufacturedProductsArray = this.quoteForm.get('manufacturedProducts').value;

    let index = 1;
    let totalLength = 0;
    let totalQuantity = 0;
    if (manufacturedProductsArray && manufacturedProductsArray.length > 0) {
      manufacturedProductsArray.forEach((mp) => {
        for (let i = 0; i < mp.qty; i++) {
          const manufacturedProduct: ManufacturedProduct = {
            frameName: frameName + '-' + index,
            frameType: frameType,
            status: 'scheduled',
            totalLength: mp.length,
            totalQuantity: 1,
            aggregatedProducts: [],
          };

          const aggregatedProduct: AggregatedProduct = {
            stick: null,
            stickType: frameType,
            code: codeName + '-' + index,
            length: mp.length,
            status: 'scheduled',
          };
          //manufacturedProduct.aggregatedProducts.push(aggregatedProduct);

          productDTO.aggregatedProducts.push(aggregatedProduct);
          productDTO.frameType = frameType;
          productDTO.frameName = frameName + '-' + index;
          totalLength += Number(mp.length);
          totalQuantity += 1;

          index++;
        }
        productDTO.totalLength = totalLength;
        productDTO.totalQuantity = totalQuantity;
      });
    }
  }

  compareFn(c1: Color, c2: Color): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  cancel() {
    console.log('cancel');
    this._dialogRef.close();
    this.quoteForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

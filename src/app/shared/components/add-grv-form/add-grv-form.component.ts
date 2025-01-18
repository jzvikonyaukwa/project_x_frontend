import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { GrvService } from "../../../../app/modules/admin/grvs/services/grv.service";
import { Observable, take } from "rxjs";
import { Router } from "@angular/router";
import { IsqGrades } from "@shared/enums/isq-grades";
import { Coatings } from "@shared/enums/coatings";
import { SupplierService } from "../../../../app/modules/admin/suppliers/services/supplier.service";
import { MatRadioChange } from "@angular/material/radio";
import { formatDate } from "@shared/utils/format-date";
import { SupplierDto } from "../../../modules/admin/suppliers/models/supplierDto";
import { ColorsService } from "@shared/services/colors.service";
import { FinishesService } from "@shared/services/finishes.service";
import { Color } from "@shared/models/color";
import { Finish } from "@shared/models/finish";
import { GaugesService } from "@shared/services/gauges.service";
import { Gauge } from "@shared/models/gauge";
import { ChangeDetectorRef } from "@angular/core";
import { GRVDetailsDTO } from "app/modules/admin/grvs/models/grvStructuredDetails";

@Component({
  selector: "app-add-grv-form",
  templateUrl: "./add-grv-form.component.html",
  styleUrls: ["./add-grv-form.component.scss"],
})
export class AddGrvFormComponent {
  public readonly ISQ_GRADES = Object.values(IsqGrades);
  public readonly COATINGS = Object.values(Coatings);

  suppliers$: Observable<SupplierDto[]> =
    this._supplierService.getAllSuppliers();

  colors$: Observable<Color[]> = this.colorsService.getAllColors();

  finishes$: Observable<Finish[]> = this.finishesService.getAllFinishes();

  gauages$: Observable<Gauge[]> = this.gaugesService.getAllGauges();

  grvForm: FormGroup = this._fb.group({
    dateReceived: ["", [Validators.required]],
    comments: [""],
    supplierGrvCode: [""],
    supplierId: [0, [Validators.required]],
    paid: [false, [Validators.required]],
    steelCoils: this._fb.array([], Validators.required),
  });

  private _baseProductForm: () => FormGroup = () =>
    this._fb.group({
      finish: ["Сhromadek", []],
      color: [null, [Validators.required]],
      isqGrade: [null, [Validators.required]],
      width: [0.925, [Validators.required]],
      coating: [null, [Validators.required]],
      gauge: [null, [Validators.required]],
      coilId: ["", [Validators.required]],
      cardNumber: ["", [Validators.required]],
      weightInKgsOnArrival: [0, [Validators.required]],
      costPerKg: [2.09, [Validators.required]],
    });

  constructor(
    private _fb: FormBuilder,
    private _grvService: GrvService,
    private _supplierService: SupplierService,
    private _router: Router,
    private colorsService: ColorsService,
    private finishesService: FinishesService,
    private gaugesService: GaugesService,
    private cdref: ChangeDetectorRef
  ) {}

  get steelCoils(): FormArray<FormGroup> {
    return this.grvForm.get("steelCoils") as FormArray;
  }

  onGalvanizeChange(formGroup: FormGroup, radioChange: MatRadioChange) {
    console.log(radioChange.value.name);
    if (radioChange.value.name === "galvanize") {
      console.log(" === galvanize");
      formGroup.get("color").removeValidators(Validators.required);
      formGroup.get("color").setValue(radioChange.value);
    } else {
      console.log(" != galvanize");
      formGroup.get("color").reset();
      formGroup.get("color").setValidators(Validators.required);
    }
    formGroup.get("color").updateValueAndValidity();
  }

  addSteelCoil(): void {
    (this.grvForm.get("steelCoils") as FormArray).push(this._baseProductForm());
  }

  onSubmit(): void {
    if (this.grvForm.invalid) {
      return;
    }

    const formValue: GRVDetailsDTO = {
      ...this.grvForm.value,
      dateReceived: formatDate(this.grvForm.value.dateReceived),
    };

    console.log(formValue);

    this._grvService
      .createGrv(formValue)
      .pipe(take(1))
      .subscribe(() => this._router.navigate(["/", "grv"]));
  }
}

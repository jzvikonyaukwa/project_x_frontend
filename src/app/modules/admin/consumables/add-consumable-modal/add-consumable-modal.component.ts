import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ConsumableCategoriesService } from "../services/consumable-categories.service";
import { Observable } from "rxjs";
import { ConsumableCategory } from "../models/consumableCategory";
import { ConsumableSourcesService } from "../services/consumable-sources.service";
import { ConsumableSource } from "../models/consumableSource";
import { Consumable } from "../models/consumable";

@Component({
  selector: "app-add-consumable-modal",
  templateUrl: "./add-consumable-modal.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
  ],
})
export class AddConsumableModalComponent implements OnInit {
  public consumableForm: FormGroup;

  public consumableCategories$: Observable<ConsumableCategory[]> =
    this.consumableCategoriesService.getAllConsumableCategories();

  public consumableSources$: Observable<ConsumableSource[]> =
    this.consumableSourcesService.getAllConsumableSources();

  edit: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Consumable,
    private dialogRef: MatDialogRef<AddConsumableModalComponent>,
    private consumableCategoriesService: ConsumableCategoriesService,
    private consumableSourcesService: ConsumableSourcesService
  ) {}

  ngOnInit() {
    this.consumableForm = this.fb.group({
      serialNumber: ["", [Validators.required]],
      name: ["", [Validators.required]],
      uom: ["each", [Validators.required]],
      sourceCountry: ["", [Validators.required]],
      category: ["", [Validators.required]],
      minQtyAlertOwned: ["", [Validators.required]],
      minQtyAlertConsignment: ["", [Validators.required]],
    });

    if (this.data) {
      this.consumableForm.patchValue({
        ...this.data,
        productCategory: this.data.category,
      });
    }
  }

  public onSubmit(): void {
    const consumable: Consumable = {
      ...this.data,
      ...this.consumableForm.value,
    };
    this.dialogRef.close(consumable);
  }

  compareFn(a: ConsumableCategory, b: ConsumableCategory): boolean {
    return a && b ? a.id === b.id : a === b;
  }
}

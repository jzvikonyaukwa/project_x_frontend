import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConsumableCategoriesService } from "../../consumables/services/consumable-categories.service";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatDialogRef } from "@angular/material/dialog";
import { ConsumableCategory } from "../../consumables/models/consumableCategory";
import { CategoryDTO } from "../../consumables/models/categoryDTO";
import { Subject, takeUntil } from "rxjs";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { CategoriesTableComponent } from "../categories-table/categories-table.component";

@Component({
  selector: "app-add-category",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    FuseAlertComponent,
    CategoriesTableComponent,
  ],
  templateUrl: "./add-category.component.html",
})
export class AddCategoryComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;

  private $destory = new Subject<void>();

  categories: ConsumableCategory[];

  showAlert = false;
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };

  allowAddCategory: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddCategoryComponent>,
    private consumableCategoriesService: ConsumableCategoriesService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getConsumableCategories();

    this.categoryForm = this.fb.group({
      name: ["", Validators.required],
    });
  }

  getConsumableCategories(): void {
    this.consumableCategoriesService
      .getAllConsumableCategories()
      .pipe(takeUntil(this.$destory))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error("Error fetching categories: ", error);
        },
      });
  }

  changeAllowAddCategory() {
    this.allowAddCategory = !this.allowAddCategory;
  }

  onDialogClose(): void {
    this.dialogRef.close();
  }

  onSubmit(categoryForm: FormGroup) {
    const category: string = categoryForm.value.name;

    const newCategory: CategoryDTO = {
      name: category,
    };

    const result: boolean = this.isCategoryUnique(newCategory);

    if (result) {
      this.consumableCategoriesService
        .addConsumableCategory(newCategory)
        .pipe(takeUntil(this.$destory))
        .subscribe({
          next: () => {
            this.dialogRef.close();
          },
          error: (error) => {
            console.error("Error adding category: ", error);
          },
        });
    } else {
      this.displayAlert("warning", "Category already exists");
    }
  }

  isCategoryUnique(newCategory: CategoryDTO): boolean {
    const categoryExists = this.categories.find(
      (category) =>
        category.name.toLowerCase() === newCategory.name.toLowerCase()
    );

    return !categoryExists;
  }

  displayAlert(type: FuseAlertType, message: string): void {
    this.showAlert = true;
    this.alert = {
      type: type,
      message: message,
    };
  }

  onEditCategory(category: ConsumableCategory): void {
    this.getConsumableCategories();
  }

  onDeleteCategory(category: ConsumableCategory): void {
    this.getConsumableCategories();
  }

  ngOnDestroy(): void {
    this.$destory.next();
    this.$destory.complete();
  }
}

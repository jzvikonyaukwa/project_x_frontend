import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { SteelCoilDetailsDTO } from "@shared/models/steelCoilDetailsDTO";
import { SteelCoilsService } from "@shared/services/steel-coils.service";
import { CoilCardComponent } from "../coil-card/coil-card.component";
import { SteelCoil } from "@shared/models/steelCoil";
import { map, startWith } from 'rxjs/operators';
import { Observable } from "rxjs";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { AgGridAngular } from "ag-grid-angular";

@Component({
  selector: "app-change-coil-modal",
  standalone: true,
  imports: [CommonModule, MatIconModule, CoilCardComponent, MatInputModule, ReactiveFormsModule, MatSelectModule, AgGridAngular],
  templateUrl: "./change-coil-modal.component.html",
})
export class ChangeCoilModalComponent implements OnInit {
  selectedGauge: number | null = null;
  selectedColor: string | null = null;
  gaugeOptions: number[] = [0.4, 0.47, 0.5, 0.55, 0.58, 0.6, 0.8, 1];
  colorOptions: string[] = ['Galvanize', 'Charcoal Grey', 'Sandstone Beige', 'Dark Dolphin', 'Traffic Green'];

  coilsInStock: SteelCoilDetailsDTO[] = [];
  filteredCoilsInStock$: Observable<SteelCoilDetailsDTO[]>;
  searchControl = new FormControl('');


  constructor(
      public dialogRef: MatDialogRef<ChangeCoilModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: {
        coilCurrentlyLoad: SteelCoil;
        machineId: number;
        width: number;
      },
      private coilService: SteelCoilsService,
  ) {}

  ngOnInit() {
    this.coilService
        .getAvailableSteelCoilsForMachine(this.data.width)
        .subscribe((steelCoils: SteelCoilDetailsDTO[]) => {
          this.coilsInStock = this.filterOutCurrentCoil(steelCoils);
          this.filteredCoilsInStock$ = this.searchControl.valueChanges.pipe(
              startWith(''),
              map(searchTerm => this.filterCoils(searchTerm))
          );
        });
  }

  filterOutCurrentCoil(steelCoils: SteelCoilDetailsDTO[]): SteelCoilDetailsDTO[] {
    if (this.data.coilCurrentlyLoad && this.data.coilCurrentlyLoad.coilNumber) {
      return steelCoils.filter(coil => coil.coilNumber !== this.data.coilCurrentlyLoad.coilNumber);
    } else {
      return steelCoils;
    }
  }

  filterCoils(searchTerm: string): SteelCoilDetailsDTO[] {
    if (!searchTerm) {
      return this.coilsInStock;
    }
    return this.coilsInStock.filter(coil =>
        coil.coilNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  newCoilLoaded(result: boolean) {
    if (result) {
      this.dialogRef.close(result);
    }
  }

  onDialogClose(): void {
    this.dialogRef.close(false);
  }

  onGaugeOrColorChange(): void {
    const gauge = this.selectedGauge;
    const color = this.selectedColor;

    this.coilService.getFilteredAvailableSteelCoils(this.data.width,gauge, color).subscribe((filteredCoils: SteelCoilDetailsDTO[]) => {
      this.updateCoilList(filteredCoils);
    });
  }

  updateCoilList(coils: SteelCoilDetailsDTO[]): void {
    this.coilsInStock = this.filterOutCurrentCoil(coils);
    this.filteredCoilsInStock$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        map(searchTerm => this.filterCoils(searchTerm))
    );
  }
}

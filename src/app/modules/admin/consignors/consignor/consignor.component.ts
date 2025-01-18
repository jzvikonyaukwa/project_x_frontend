import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { MatIconModule } from '@angular/material/icon';
import { ConsignorSteelCoilTableComponent } from '../consignor-steel-coil-table/consignor-steel-coil-table.component';
import { ConsignorConsumableTableComponent } from '../consignor-consumable-table/consignor-consumable-table.component';

@Component({
  selector: 'app-consignor',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    MatIconModule,
    ConsignorSteelCoilTableComponent,
    ConsignorConsumableTableComponent
  ],
  templateUrl: './consignor.component.html',
  styleUrls: ['./consignor.component.scss']
})
export class ConsignorComponent {

  constructor() { }
}

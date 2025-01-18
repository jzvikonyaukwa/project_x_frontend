import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MachinesComponent } from "./machines.component";
import { RouterModule } from "@angular/router";
import { machinesRoutes } from "./machines.routing";
import { InProgressCuttingListSummaryComponent } from "./in-progress-cutting-list-summary/in-progress-cutting-list-summary.component";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDividerModule } from "@angular/material/divider";
import { CuttingListSheetsTableComponent } from "./cutting-list-sheets-table/cutting-list-sheets-table.component";
import { MachineComponent } from "../machine/machine.component";
import { MachinesSheduledCuttingListsComponent } from "./machines-sheduled-cutting-lists/machines-sheduled-cutting-lists.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MachineEventsTableComponent } from "./machine-events-table/machine-events-table.component";
import { AgGridModule } from "ag-grid-angular";
import { CoilInUseComponent } from "./coil-in-use/coil-in-use.component";
import { StockListTableComponent } from "../../admin/stock/stock-list-table/stock-list-table.component";
import { LoadCoilPageComponent } from "./load-coil-page/load-coil-page.component";
import { CuttingListComponent } from "../../admin/cutting-list/cutting-list.component";
import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { CoilCardComponent } from "../machine-board/coil-card/coil-card.component";
import { CuttingListCardComponent } from "../machine-board/cutting-list-card/cutting-list-card.component";
import { CuttingListDetailsModalComponent } from "app/modules/admin/cutting-lists/cutting-list-details-modal/cutting-list-details-modal.component";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import {FuseAlertComponent} from "@fuse/components/alert";

@NgModule({
  declarations: [
    MachinesComponent,
    InProgressCuttingListSummaryComponent,
    MachineComponent,
    MachinesSheduledCuttingListsComponent,
    MachineEventsTableComponent,
    CoilInUseComponent,
    LoadCoilPageComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(machinesRoutes),
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatDividerModule,
        CuttingListSheetsTableComponent,
        MatFormFieldModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSidenavModule,
        MatTabsModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        AgGridModule,
        StockListTableComponent,
        CuttingListComponent,
        CdkDropList,
        CdkDrag,
        CuttingListCardComponent,
        PageHeadingComponent,
        CuttingListDetailsModalComponent,
        FuseAlertComponent,
        CoilCardComponent,
    ],
})
export class MachinesModule {}

import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { clientsRoutes } from "./clients.routing";
import { ClientsComponent } from "./clients.component";
import { ClientsTableComponent } from "./clients-table/clients-table.component";
import { AgGridModule } from "ag-grid-angular";
import { SharedModule } from "@shared/shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { CustomerComponent } from "./customer/customer.component";
import { MatTabsModule } from "@angular/material/tabs";
import { ClientsQuoteListComponent } from "./clients-quote-list/clients-quote-list.component";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { ClientsDeliveryNoteListComponent } from "./clients-delivery-note-list/clients-delivery-note-list.component";
import { FuseCardComponent } from '@fuse/components/card';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";

@NgModule({
  declarations: [
    ClientsComponent,
    ClientsTableComponent,
    CustomerComponent,
    ClientsQuoteListComponent,
    ClientsDeliveryNoteListComponent,
  ],
  imports: [
    RouterModule.forChild(clientsRoutes),
    CommonModule,
    AgGridModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    PageHeadingComponent,
    FuseCardComponent,
    MatSnackBarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class ClientsModule {}

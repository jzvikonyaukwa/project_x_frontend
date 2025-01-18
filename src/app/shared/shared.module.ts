import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
// import { FuseCardModule } from "@fuse/components/card";
import { MatButtonModule } from "@angular/material/button";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { CUSTOM_DATE_FORMAT } from "@shared/constants/custom-date-format";
import {
  MAT_LUXON_DATE_ADAPTER_OPTIONS,
  MatLuxonDateModule,
} from "@angular/material-luxon-adapter";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { EnumToArrayPipe } from "./pipes/enum-to-array.pipe";
import { MatDialogModule } from "@angular/material/dialog";
import { UserEditAddressesModalComponent } from "./components/user-edit-adresses-modal/user-edit-addresses-modal.component";
import { UserEditPhonesModalComponent } from "./components/user-edit-phones-modal/user-edit-phones-modal.component";
import { UserEditEmailsModalComponent } from "./components/user-edit-emails-modal/user-edit-emails-modal.component";
import { UserEditNameModalComponent } from "./components/user-edit-name-modal/user-edit-name-modal.component";

import { AddGrvFormComponent } from "./components/add-grv-form/add-grv-form.component";
import { AsFormArrayPipe } from "./pipes/as-form-array.pipe";
import { MatSelectModule } from "@angular/material/select";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    // FuseCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatLuxonDateModule,
    MatDialogModule,
    DragDropModule,
    MatSelectModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatLuxonDateModule,
    EnumToArrayPipe,
    AsFormArrayPipe,
    DragDropModule,
  ],
  declarations: [
    EnumToArrayPipe,
    UserEditAddressesModalComponent,
    UserEditNameModalComponent,
    UserEditPhonesModalComponent,
    UserEditEmailsModalComponent,
    AsFormArrayPipe,
    AddGrvFormComponent,
  ],
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMAT,
    },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ],
})
export class SharedModule {}

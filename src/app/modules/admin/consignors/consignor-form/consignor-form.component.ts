import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ModalService } from '@shared/services/modal.service';
import { AddConsignorComponent } from '../add-consignor/add-consignor.component';

@Component({
  selector: 'app-consignor-form',
  templateUrl: './consignor-form.component.html',
  styleUrls: ['./consignor-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule
  ]
})
export class ConsignorFormComponent {

  public consigmentForm: FormGroup;

  constructor(private _fb: FormBuilder, private _dialogRef: MatDialogRef<AddConsignorComponent>) {
    this.consigmentForm = _fb.group({
      name: ['', [Validators.required]]
    })
   }

  public onSubmit(): void {
    this._dialogRef.close(this.consigmentForm.get('name').value);
  }

}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ConsignorFormComponent } from '../consignor-form/consignor-form.component';

@Component({
  selector: 'app-add-consignor',
  templateUrl: './add-consignor.component.html',
  styleUrls: ['./add-consignor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ConsignorFormComponent
  ]
})
export class AddConsignorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

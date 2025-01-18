import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import { ManufacturingBoardComponent } from "./manufacturing-board/manufacturing-board.component";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { Observable } from "rxjs";
import { Machine } from "../machines/models/machine";
import { MachineService } from "../machines/services/machine.service";
import { MACHINE_INFORMATION } from "../machines/models/machinesInformations";
import { MachineInformation } from "../machines/models/machineInformation";

@Component({
  selector: "app-coil-board",
  standalone: true,
  imports: [CommonModule, ManufacturingBoardComponent, PageHeadingComponent],
  templateUrl: "./machine-board.component.html",
})
export class MachineBoardComponent implements OnInit {
  machine$: Observable<Machine> | undefined;

  productCategories: MachineInformation[] = MACHINE_INFORMATION;
  productCategory: MachineInformation | undefined;

  constructor(
    private route: ActivatedRoute,
    private machineService: MachineService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const categoryId = parseInt(params["id"]);

      console.log("In the MachineBoardComponent Category Id: ", categoryId);

      this.productCategory = this.getProductInformation(categoryId);

      console.log(
        "In the MachineBoardComponent Machine Id: ",
        this.productCategory
      );

      this.machine$ = this.machineService.getMachine(
        this.productCategory.machineId
      );
    });
  }

  getProductInformation(categoryId: number): MachineInformation {
    return this.productCategories.find(
      (product) => product.categoryId === categoryId
    );
  }
}

export interface ManufacturingInfo {
  machineId: number;
  product: string;
}

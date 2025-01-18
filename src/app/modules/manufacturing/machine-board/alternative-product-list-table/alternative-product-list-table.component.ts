import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import { GridApi, ColDef, GridReadyEvent } from "ag-grid-enterprise";
import { ProductInformation } from "../../../admin/cutting-lists/models/cuttingListInformationDTO";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { DEFAULTCOLUMNDEF } from "app/utilities/ag-grid/defaultColumnDef";
import { ProductSummaryDetailsDTO } from "app/modules/admin/cutting-lists/models/productSummaryDetailsDTO";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { MatDialog } from "@angular/material/dialog";
import { CuttingListDetailsModalComponent } from "app/modules/admin/cutting-lists/cutting-list-details-modal/cutting-list-details-modal.component";

@Component({
  selector: "app-alternative-product-list-table",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatButtonModule, MatIconModule],
  templateUrl: "./alternative-product-list-table.component.html",
  styleUrls: ["./alternative-product-list-table.component.scss"],
})
export class AlternativeProductListTableComponent implements OnChanges {
  @Input() cuttingLists: ProductSummaryDetailsDTO[] = [];

  public pagination = true;
  public paginationPageSize = "10";
  public gridApi!: GridApi<any>;
  public tooltipShowDelay = 300;

  rowData: ProductInformation[];

  public defaultColDef: ColDef = DEFAULTCOLUMNDEF;

  public columnDefs: ColDef[] = [
    {
      field: "productId",
      headerTooltip: "Product List Id",
      headerName: "ID",
      width: 100,
    },
    {
      field: "clientName",
      headerTooltip: "Client Name",
      headerName: "CLIENT",
      width: 200,
    },
    {
      field: "completedLength",
      headerTooltip: "Cuts Left",
      headerName: "MTRS TO DO",
      width: 180,
    },
    {
      field: "scheduledLength",
      headerTooltip: "Meters Left",
      headerName: "MTRS LEFT",
      width: 160,
    },
    {
      field: "priority",
      headerTooltip: "Priority",
      headerName: "PRIORITY",
      width: 180,
    },
    {
      field: "color",
      headerTooltip: "Color",
      headerName: "COLOR",
      width: 180,
      cellStyle: (params) => {
        const colorMap = {
          "Galvanize": "#FFF8DC", // Cornsilk
          "Sandstone Beige": "#FAEBD7", // Antique White
          // Add more colors if needed
        };
        return {
          backgroundColor: colorMap[params.value] || "#FFFFFF",
          border: "1px solid #DDDDDD", // Subtle border
          color: "#000000", // Text color
        };
      },
    },
    {
      field: "gauge",
      headerTooltip: "Gauge",
      headerName: "GAUGE",
      width: 130,
      cellStyle: (params) => {
        const gaugeColor = params.value > 0.45 ? "#DFFFD6" : "#FFE6E6"; // Soft green or pink
        return {
          backgroundColor: gaugeColor,
          border: "1px solid #DDDDDD",
          color: "#000000",
        };
      },
    },
    {
      field: "width",
      headerTooltip: "Width",
      headerName: "WIDTH",
      width: 130,
      cellStyle: (params) => {
        const widthColor = params.value > 900 ? "#E0F7FA" : "#FFEBEE"; // Light cyan or light pink
        return {
          backgroundColor: widthColor,
          border: "1px solid #DDDDDD",
          color: "#000000",
        };
      },
    },
    {
      field: "quoteDateAccepted",
      headerTooltip: "Accepted",
      headerName: "ACCEPTED",
      cellRenderer: (params) => {
        if (params.value) {
          const dateObj = new Date(params.value);
          return dateObj.toLocaleDateString();
        }
      },
    },
    {
      field: "targetDate",
      headerTooltip: "Target Date",
      headerName: "TARGET DATE",
      cellRenderer: (params) => {
        if (params.value) {
          const dateObj = new Date(params.value);
          return dateObj.toLocaleDateString();
        }
      },
    },
    {
      field: "productId",
      headerName: "VIEW SHEET",
      headerTooltip: "View Sheet",
      width: 130,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          const list = this.cuttingLists.find(
            (list) => list.productId === id
          );
          this.onCuttingListClick(list);
        },
      },
    },
  ];

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cuttingLists) {
      // this.createDataForTable(changes.cuttingLists.currentValue);
      this.rowData = changes.cuttingLists.currentValue;
    }
  }

  onCuttingListClick(cuttingList) {
    const dialogRef = this.dialog.open(CuttingListDetailsModalComponent, {
      data: {
        product: cuttingList.productId,
        manufacture: false,
      },
      width: "80vw",
      maxHeight: "80vh",
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    this.gridApi.setDomLayout("autoHeight");
  }

  // can delete this method
  createDataForTable(cuttingLists: ProductInformation[]) {
    cuttingLists.forEach((cuttingList: ProductInformation | any) => {
      let cutsMade = 0;
      let totalMeters = 0;
      let metersRequired = 0;
      cuttingList.cuttingList.manufacturedProducts.forEach((product) => {
        if (product.status === "completed") {
          cutsMade++;
          metersRequired += product.length;
        }
        totalMeters += product.length;
      });
      cuttingList.cuttingList.cutsMade =
        cutsMade + "/" + cuttingList.cuttingList.manufacturedProducts.length;
      cuttingList.cuttingList.metersLeft =
        (metersRequired.toFixed(2) ?? 0) + "/" + (totalMeters.toFixed(2) ?? 0);
    });

    return cuttingLists;
  }

  onPaginationChanged() {
    // Workaround for bug in events order
    if (this.gridApi!) {
      this.setText(
        "#lbCurrentPage",
        this.gridApi.paginationGetCurrentPage() + 1
      );
      this.setText("#lbTotalPages", this.gridApi.paginationGetTotalPages());
    }
  }

  setText(selector: string, text: any) {
    (document.querySelector(selector) as any).innerHTML = text;
  }

  lastRowBorder(params) {
    if (params.node.rowIndex % 2 !== 0) {
      return {
        "background-color": "#EFF7FC",
      };
    } else {
      return {
        "background-color": "#FFFFFF",
      };
    }
  }

  onBtNext() {
    this.gridApi.paginationGoToNextPage();
  }

  onBtPrevious() {
    this.gridApi.paginationGoToPreviousPage();
  }

  public onPageSizeChanged(): void {
    const value = (document.getElementById("page-size") as HTMLInputElement)
      .value;
    this.paginationPageSize = value;
    this.gridApi.paginationSetPageSize(Number(value));
  }
}

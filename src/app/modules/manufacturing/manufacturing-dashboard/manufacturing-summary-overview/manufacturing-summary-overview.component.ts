import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AgGridModule } from "ag-grid-angular";
import { ChartToolPanelsDef, ColDef, GridReadyEvent } from "ag-grid-enterprise";
import "ag-grid-enterprise";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { ManufacturedProductService } from "../../../admin/cutting-lists/services/manufacturedProduct.service";
import {
  ManufacturedProductCountDTO,
  ManufacturedProductStatusCountDTO,
  MonthlyManufacturedProductCountDTO,
} from "./models/manufacturing-summary";

@Component({
  selector: "app-manufacturing-summary-overview",
  standalone: true,
  imports: [CommonModule, AgGridModule, MatIconModule],
  templateUrl: "./manufacturing-summary-overview.component.html",
  styleUrls: ["./manufacturing-summary-overview.component.scss"],
})
export class ManufacturingSummaryOverviewComponent
  implements OnInit, OnChanges
{
  // Date Ranges
  @Input() startDate: string;
  @Input() endDate: string;

  public pagination = true;
  public paginationPageSize = 10;
  paginationPageSizeSelector = [10, 20, 50, 100];
  rowData: any[] = [];

  manufacturedProductsChart: string = "manufacturedProductsChartContainer";
  barChart: string = "barChartContainer";
  manufacturedProductsStatusChart: string = "manufacturedProductsStatusChart";

  public defaultColDef: ColDef = {};
  public chartToolPanelsDef: ChartToolPanelsDef = {
    panels: [],
  };
  public groupDisplayType = "groupRows";
  public gridApi;

  constructor(
    private _router: Router,
    private manufacturedProductService: ManufacturedProductService
  ) {}

  ngOnInit() {
    this.fetchManufacturedProductCount();
    this.fetchManufacturedProductStatusCount();
    this.fetchManufacturedProductMonthlyCount();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.startDate || changes.endDate) {
      this.fetchManufacturedProductCount();
      this.fetchManufacturedProductStatusCount();
      this.fetchManufacturedProductMonthlyCount();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setGridOption("domLayout", "autoHeight");
  }

  fetchManufacturedProductCount(startDate?: string, endDate?: string) {
    startDate = this.startDate;
    endDate = this.endDate;

    this.manufacturedProductService
      .getManufacturedProductCount(startDate, endDate)
      .subscribe((data: ManufacturedProductCountDTO[]) => {
        console.log("Fetched manufactured product count data:", data);
        // if (data.length > 0) {
        //   this.createPieChart(data);
        // } else {
        //   console.warn('No data available to create manufactured product summary chart');
        // }
        setTimeout(() => {
          this.createPieChart(data);
        }, 1000); // Add a timeout to ensure the chart container is available
      });
  }

  fetchManufacturedProductStatusCount(startDate?: string, endDate?: string) {
    startDate = this.startDate;
    endDate = this.endDate;
    this.manufacturedProductService
      .getManufacturedProductStatusCount(startDate, endDate)
      .subscribe((data: ManufacturedProductStatusCountDTO[]) => {
        console.log("Fetched manufactured product status count data:", data);
        // if (data.length > 0) {
        //   this.createStatusPieChart(data);
        // } else {
        //   console.warn('No data available to create status summary chart');
        // }
        setTimeout(() => {
          // this.createStatusPieChart(data);
        }, 1000); // Add a timeout to ensure the chart container is available
      });
  }

  fetchManufacturedProductMonthlyCount(year?: number) {
    this.manufacturedProductService
      .getManufacturedProductMonthlyCount(year)
      .subscribe((data: MonthlyManufacturedProductCountDTO[]) => {
        console.log("Fetched monthly manufactured product count data:", data);
        if (data.length > 0) {
          // this.createBarChart(data);
        } else {
          console.warn(
            "No data available to create monthly manufactured product summary chart"
          );
        }
      });
  }

  createPieChart(data: ManufacturedProductCountDTO[]) {
    const transformedData = data.map((item) => ({
      planName: this.mapPlanName(item.productType),
      count: item.count,
    }));

    const container = document.getElementById(this.manufacturedProductsChart);
    if (container) {
      container.innerHTML = ""; // Clear the existing chart
    }

    // const options: AgChartOptions = {
    //   container,
    //   autoSize: true,
    //   title: {
    //     text: "Manufactured Products Summary",
    //   },
    //   series: [
    //     {
    //       type: "pie",
    //       angleKey: "count",
    //       labelKey: "planName",
    //       label: {
    //         enabled: true,
    //       },
    //       callout: {
    //         strokeWidth: 2,
    //       },
    //       tooltip: {
    //         enabled: true,
    //         renderer: ({ datum }) => {
    //           return {
    //             content: `${datum.planName}: ${datum.count.toFixed(0)}`,
    //           }; // Format tooltip to remove decimals
    //         },
    //       },
    //       data: transformedData,
    //     },
    //   ],
    //   legend: {
    //     position: "bottom",
    //     item: {
    //       paddingX: 16,
    //       paddingY: 8,
    //     },
    //   },
    // };

    // AgChart.create(options);
  }

  // createStatusPieChart(data: ManufacturedProductStatusCountDTO[]) {
  //   const transformedData = data.map((item) => ({
  //     status: this.mapStatus(item.status),
  //     count: item.count,
  //   }));

  //   const container = document.getElementById(
  //     this.manufacturedProductsStatusChart
  //   );
  //   if (container) {
  //     container.innerHTML = ""; // Clear the existing chart
  //   }

  //   const options: AgChartOptions = {
  //     container,
  //     autoSize: true,
  //     title: {
  //       text: "Manufactured Products Status Summary",
  //     },
  //     series: [
  //       {
  //         type: "pie",
  //         angleKey: "count",
  //         labelKey: "status",
  //         label: {
  //           enabled: true,
  //         },
  //         callout: {
  //           strokeWidth: 2,
  //         },
  //         tooltip: {
  //           enabled: true,
  //           renderer: ({ datum }) => {
  //             return { content: `${datum.status}: ${datum.count.toFixed(0)}` };
  //           },
  //         },
  //         data: transformedData,
  //       },
  //     ],
  //     legend: {
  //       position: "bottom",
  //       item: {
  //         paddingX: 16,
  //         paddingY: 8,
  //       },
  //     },
  //   };

  //   AgChart.create(options);
  // }

  // createBarChart(data: MonthlyManufacturedProductCountDTO[]) {
  //   const { transformedData, productTypes } = this.transformBarChartData(data);

  //   const options: AgChartOptions = {
  //     container: document.getElementById(this.barChart),
  //     autoSize: true,
  //     title: {
  //       text: "Monthly Manufactured Products Count by Type",
  //     },
  //     data: transformedData,
  //     series: productTypes.map((productType: string) => ({
  //       type: "column",
  //       xKey: "month",
  //       yKey: productType,
  //       yName: productType,
  //       grouped: true,
  //       label: {
  //         enabled: false,
  //         fontSize: 10,
  //         formatter: ({ value }) => value.toFixed(0),
  //       },
  //       tooltip: {
  //         enabled: true,
  //         renderer: ({ yValue }) => {
  //           return { content: `${productType}: ${yValue.toFixed(0)}` };
  //         },
  //       },
  //     })),
  //     axes: [
  //       {
  //         type: "category",
  //         position: "bottom",
  //         title: {
  //           text: "Month",
  //         },
  //         label: {
  //           rotation: 0,
  //           fontSize: 12,
  //         },
  //       },
  //       {
  //         type: "number",
  //         position: "left",
  //         title: {
  //           text: "Count",
  //         },
  //       },
  //     ],
  //     legend: {
  //       position: "bottom",
  //       item: {
  //         paddingX: 16,
  //         paddingY: 8,
  //       },
  //     },
  //   };

  //   AgChart.create(options);
  // }

  transformBarChartData(data: MonthlyManufacturedProductCountDTO[]) {
    const groupedData = data.reduce((acc, item) => {
      const monthName = this.mapMonth(item.month);
      if (!acc[monthName]) {
        acc[monthName] = { month: monthName };
      }
      acc[monthName][item.productType || "Unknown"] = item.count;
      return acc;
    }, {});

    const productTypes = [
      ...new Set(data.map((item) => item.productType || "Unknown")),
    ];

    const transformedData = Object.values(groupedData).map((item) => {
      productTypes.forEach((type) => {
        if (!item[type]) {
          item[type] = 0;
        }
      });
      return item;
    });

    return { transformedData, productTypes };
  }

  mapPlanName(planName: string): string {
    switch (planName?.toUpperCase()) {
      case "SHEETS":
        return "Roof Sheets";
      case "BRACES":
      case "FLOOR JOISTS":
      case "ROOF PANELS":
      case "TRUSSES":
      case "WALL FRAMES":
        return "Framecad";
      case "PURLINS":
      case "BATTENS":
        return "Purlin and Batten";
      default:
        return planName || "Unknown";
    }
  }

  mapStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "Completed";
      case "IN-PROGRESS":
        return "In Progress";
      case "SCHEDULED":
        return "Scheduled";
      default:
        return status || "Unknown";
    }
  }

  mapMonth(month: number): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month - 1];
  }

  exportToExcel() {
    this.gridApi.exportDataAsExcel();
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
}

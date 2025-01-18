import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-enterprise";
import { ProjectSummary } from "./models/projectSummary";
import { Observable, tap } from "rxjs";
import { ProjectService } from "./services/project.service";
import { COLUMN_DEFINITIONS } from "app/utilities/ag-grid/column-definitions";
import { AgGridModule } from "ag-grid-angular";
import { PageHeadingComponent } from "@layout/common/page-heading/page-heading.component";
import { MatIconModule } from "@angular/material/icon";
import { AccessButtonAgGridComponent } from "app/utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-projects",
  standalone: true,
  imports: [CommonModule, AgGridModule, PageHeadingComponent, MatIconModule],
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent {
  private projectService = inject(ProjectService);
  private _router = inject(Router);
  public pagination = true;
  public paginationPageSize = "15";
  public paginationPageSizeSelector = [10, 15, 20, 50];
  public gridApi: GridApi;
  rowData: ProjectSummary[];

  public projectsSummary$: Observable<ProjectSummary[]> = this.projectService
    .getAllProjectsSummary()
    .pipe(
      tap((projects) => {
        this.rowData = projects;
      })
    );

  public columnDefs: ColDef[] = [
    { headerName: "ID", field: "id", width: 100 },
    {
      headerName: "PROJECT NAME",
      field: "projectName",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      width: 280,
    },
    {
      headerName: "CLIENT NAME",
      field: "clientName",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      width: 280,
    },
    { headerName: "ACCEPTED QUOTES", field: "acceptedQuotes", width: 130 },
    {
      headerName: "COMPLETED CUTTING LISTS",
      field: "completedCuttingLists",
      width: 150,
    },
    {
      headerName: "REMAINING CUTTING LISTS",
      field: "scheduledCuttingLists",
      width: 150,
    },
    {
      headerName: "TOTAL CUTTING LISTS",
      field: "totalCuttingLists",
      width: 150,
    },
    {
      field: "id",
      headerName: "VIEW",
      width: 130,
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => this._router.navigate(["/projects", id]),
      },
    },
  ];

  public defaultColDef: ColDef = COLUMN_DEFINITIONS;

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption("domLayout", "autoHeight");
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

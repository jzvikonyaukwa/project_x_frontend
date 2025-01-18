import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
// import { SteelCoilDetailsDTO } from "../../steel-coils/models/steelCoilDetailsDTO";
import { SteelCoilsService } from '../../../../shared/services/steel-coils.service';
import { AccessButtonAgGridComponent } from '../../../../utilities/ag-grid/access-button-ag-grid/access-button-ag-grid.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MachineEventsService } from '../services/machine-events.service';
import { SteelCoilInUseId } from '../models/steelCoilInUseId';
import { ProductInformation } from '../../../admin/cutting-lists/models/cuttingListInformationDTO';
import { ProductService } from '../../../admin/product/product.service';
import { SteelCoilDetailsDTO } from '../../../../shared/models/steelCoilDetailsDTO';
import { ProductDTO } from '../../../admin/cutting-lists/models/productDTO';
import { ManufacturedProduct } from '../../../admin/cutting-lists/models/manufacturedProduct';

@Component({
  selector: 'app-load-coil-page',
  templateUrl: './load-coil-page.component.html',
  styleUrls: ['./load-coil-page.component.scss'],
})
export class LoadCoilPageComponent implements OnInit {
  machineId: number;
  steelCoilId: number;

  rowData$: Observable<SteelCoilDetailsDTO[]> = this.steelCoilsService
    .getAllSteelCoilsInStock()
    .pipe(
      tap((data) => {
        console.log('SteelCoilDetailsDTO[] = ', data);
      }),
    );

  columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'steelCoilId',
      maxWidth: 120,
    },
    {
      headerName: 'COIL NUMBER',
      field: 'coilNumber',
    },
    {
      headerName: 'CARD #',
      field: 'cardNumber',
    },
    {
      headerName: 'ISQ',
      field: 'isqGrade',
    },

    {
      headerName: 'KGS',
      field: 'weightInKgsRemaining',
    },
    {
      headerName: 'MTRS ',
      field: 'metersRemaining',
    },
    {
      headerName: 'WIDTH',
      field: 'width',
    },
    {
      headerName: 'COATING',
      field: 'coating',
    },
    {
      headerName: 'FINISH',
      field: 'finish',
    },
    {
      headerName: 'GAUGE',
      field: 'gauge',
    },
    {
      headerName: 'COLOR',
      field: 'color',
      width: 220,
    },
    {
      headerName: 'LOAD',
      field: 'steelCoilId',
      cellRenderer: AccessButtonAgGridComponent,
      cellRendererParams: {
        onClick: (id: number) => {
          // this.router.navigate(["/grv", id]);
          this.loadCoil(id);
        },
      },
    },
  ];

  public rowSelection: 'single' | 'multiple' = 'single';

  private gridApi!: GridApi<SteelCoilDetailsDTO>;

  scheduledCuttingLists: ProductInformation[];
  filteredScheduledCuttingLists: ProductInformation[];

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private steelCoilsService: SteelCoilsService,
    private machineEventService: MachineEventsService,
    private cuttingListService: ProductService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.machineId = parseInt(params['id']);
      if (isNaN(this.machineId)) {
        console.log('URL did not contain a number. machineId was not added to URL');
      } else {
        console.log('LoadCoilPageComponent machineId = ', this.machineId);
        this.machineEventService
          .getCoilIdInUse(this.machineId)
          .subscribe((data: SteelCoilInUseId) => {
            this.steelCoilId = data.steelCoilId;
            console.log('steelCoilId = ', this.steelCoilId);
          });

        // this.getScheduledCuttingListsForMachine();
      }
    });
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
    params.api.setGridOption('domLayout', 'autoHeight');
  }

  onSelectionChanged() {
    const selectedRows = this.gridApi.getSelectedRows();
    const steelCoilSelected: SteelCoilDetailsDTO = selectedRows[0] as SteelCoilDetailsDTO;
    // this.filterScheduledCuttingLists(steelCoilSelected);
  }

  // filterScheduledCuttingLists(coilSelected: SteelCoilDetailsDTO) {
  //   this.filteredScheduledCuttingLists = this.scheduledCuttingLists.filter(
  //     (cuttingList) => {
  //       return cuttingList.color === coilSelected.color;
  //     }
  //   );
  // }

  // getScheduledCuttingListsForMachine(): void {
  //   this.scheduledCuttingLists = null;
  //   this.cuttingListService
  //     .getCuttingListsScheduledForMachine(this.machineId)
  //     .pipe(takeUntil(this.ngUnsubscribe))
  //     .subscribe((data: CuttingListInformation[]) => {
  //       console.log("Scheduled cuttingLists for this machine = ", data);
  //       this.filteredScheduledCuttingLists = this.scheduledCuttingLists = data;
  //     });
  // }

  loadCoil(id: number) {
    console.log(id);
    this.machineEventService.loadCoil(this.machineId, id).subscribe((data) => {
      console.log(data);
      this.router.navigate(['machines/1'], { queryParamsHandling: 'preserve' });
    });
  }

  toggleCompleted(event: any) {
    console.log('event = ', event);

    if (event.checked) {
      this.filteredScheduledCuttingLists = this.scheduledCuttingLists.filter(
        (cuttingList) => cuttingList.quoteStatus != 'draft',
      );
    } else {
      // this.getScheduledCuttingListsForMachine();
    }
  }

  changeCuttingListStatusChange(productId: number): void {
    this.cuttingListService
      .changeProductStatus(productId, 'in-progress')
      .subscribe((productId: ProductDTO) => {
        console.log('cutting list returned = ', productId);
        this.router.navigate(['machines/1'], {
          queryParamsHandling: 'preserve',
        });
      });
  }

  calculateTotalMeters(manufacturedProducts: ManufacturedProduct[]): string {
    let totalMeters = 0;

    for (const product of manufacturedProducts) {
      totalMeters += product.totalLength;
    }

    return totalMeters.toFixed(2);
  }
}

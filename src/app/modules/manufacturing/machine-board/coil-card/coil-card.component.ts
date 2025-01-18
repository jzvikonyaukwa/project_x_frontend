import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AddWastageModalComponent } from 'app/modules/manufacturing/machine-board/add-wastage-modal/add-wastage-modal.component';
import { MachineEventsService } from '../../machines/services/machine-events.service';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AlertService } from '../services/alert-service.service';

@Component({
  selector: 'app-coil-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatDialogModule, FuseAlertComponent],
  templateUrl: './coil-card.component.html',
})
export class CoilCardComponent implements OnInit {
  @Input() coil: SteelCoilDetailsDTO;
  @Input() isCoilChange = false;
  @Input() machineId: number;
  @Output() coilChangedEmitter = new EventEmitter<boolean>();

  coilBgColor = 'bg-';
  coilBorderColor = 'border-';
  coilTextColor = 'text-';

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private machineEventsService: MachineEventsService,
    private alertService: AlertService, // Inject AlertService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params['machineId']) {
        this.machineId = parseInt(params['machineId']);
      }
    });
    this.coilBgColor += this.coil.cssColor;
    this.coilBorderColor += this.coil.cssColor;
    if (
      this.coil.color === 'White Lion' ||
      this.coil.color === 'Fish Eagle White' ||
      this.coil.color === 'Galvanize'
    ) {
      this.coilTextColor += 'axe-dark-blue';
    } else this.coilTextColor += 'white';
  }

  onAddWastage(): void {
    const dialogRef = this.dialog.open(AddWastageModalComponent, {
      data: this.coil,
    });

    dialogRef.afterClosed().subscribe((res) => {
      console.log('onAddWastage. res: ', res);
    });
  }

  onViewCoil(coil: SteelCoilDetailsDTO): void {
    this.router.navigate(['stocks', coil.steelCoilId]);
    this.coilChangedEmitter.emit(false);
  }

  onCoilLoad(coil: SteelCoilDetailsDTO): void {
    this.machineEventsService.loadCoil(this.machineId, coil.steelCoilId).subscribe({
      next: (res) => {
        console.log('onCoilLoad. res: ', res);
        this.coilChangedEmitter.emit(true);
      },
      error: (err) => {
        console.log('Loading coil failed. Error: ', err.error);
        this.alertService.setAlert({
          type: 'warning',
          message: 'Loading coil failed. Error: ' + err.error.message,
        });
        this.coilChangedEmitter.emit(false);
        console.log(err);
      },
    });
  }
}

import { Injectable } from '@angular/core';
import { ProductInformation } from '../../../admin/cutting-lists/models/cuttingListInformationDTO';
import { CoilAndCuttingList } from '../manufacturing-board/models/coilsAndCuttingList';
import { CuttingListDTO } from '../../../admin/cutting-lists/models/productDTO';
import { SteelCoilDetailsDTO } from '../../../../shared/models/steelCoilDetailsDTO';
import { priorityOrder } from '@shared/models/priorityOrder';
import { MachineEvent } from '../../machines/models/machineEvent';

@Injectable({
  providedIn: 'root',
})
export class CoilAndCuttingListService {
  findMatchingCuttingListsAndRemoveFromCuttingLists(
    color: string,
    gauge: number,
    cuttingLists: ProductInformation[],
  ): ProductInformation[] {
    const matchingCuttingLists: ProductInformation[] = [];

    for (let i = cuttingLists.length - 1; i >= 0; i--) {
      if (cuttingLists[i].color === color && cuttingLists[i].gauge === gauge) {
        matchingCuttingLists.push(cuttingLists[i]);
        cuttingLists.splice(i, 1);
      }
    }
    return matchingCuttingLists;
  }

  createOrderCuttingListsWithCoil(
    cuttingLists: ProductInformation[],
    coilsInStock: SteelCoilDetailsDTO[],
    machineLastEvent: MachineEvent,
  ) {
    const columns: CoilAndCuttingList[] = [];

    cuttingLists.forEach((cl) => {
      let column = columns.find((col) => col.color === cl.color && col.gauge === cl.gauge);

      if (column) {
        column.cuttingLists.push(cl);
        column.totalMeteres += this.calculateCuttingListTotalMeters(cl.cuttingList);
      } else {
        column = {
          color: cl.color,
          gauge: cl.gauge,
          totalMeteres: this.calculateCuttingListTotalMeters(cl.cuttingList),
          cuttingLists: [],
          steelCoils: null,
          recommendedCoil: null,
        };
        column.cuttingLists.push(cl);
        columns.push(column);
      }
    });

    columns.forEach((column) => {
      column.steelCoils = this.addAllMatchingSteelCoils(column.color, column.gauge, coilsInStock);

      column.recommendedCoil = this.findAppropriateCoil(
        column.color,
        column.gauge,
        column.totalMeteres,
        coilsInStock,
        machineLastEvent,
      );
      column.cuttingLists.sort(
        (a, b) => priorityOrder[a.cuttingList.priority] - priorityOrder[b.cuttingList.priority],
      );
    });

    return columns;
  }

  calculateCuttingListTotalMeters(cuttingList: CuttingListDTO): number {
    let totalMeteres = 0;
    cuttingList.manufacturedProducts.forEach((product) => {
      totalMeteres += product.length;
    });
    return totalMeteres;
  }

  addAllMatchingSteelCoils(
    color: string,
    gauge: number,
    coilsInStock: SteelCoilDetailsDTO[],
  ): SteelCoilDetailsDTO[] {
    return coilsInStock.filter((coil) => {
      return coil.color === color && coil.gauge === gauge;
    });
  }

  findAppropriateCoil(
    color: string,
    gauge: number,
    totalMeters: number,
    coilsInStock: SteelCoilDetailsDTO[],
    machineLastEvent: MachineEvent,
  ): SteelCoilDetailsDTO {
    let steelCoil: SteelCoilDetailsDTO;

    coilsInStock.forEach((coil) => {
      if (
        coil.color === color &&
        coil.gauge === gauge &&
        coil.steelCoilId != machineLastEvent?.steelCoil.id
      ) {
        if (steelCoil) {
          const currentSteelCoilMtrs = steelCoil.estMtrsRemaining - totalMeters;
          const possibleSteelCoilMtrs = coil.estMtrsRemaining - totalMeters;
          if (possibleSteelCoilMtrs < currentSteelCoilMtrs) {
            steelCoil = coil;
          }
        } else {
          steelCoil = coil;
        }
      }
    });

    return steelCoil;
  }
}

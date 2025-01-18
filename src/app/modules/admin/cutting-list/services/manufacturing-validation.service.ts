import { Injectable } from '@angular/core';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { ManufacturedProductFlatMapped } from '../models/manufactured-products-flatmapped';
import { AlertService } from './alert-cutting-list.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingValidationService {
  constructor(private alertService: AlertService) {}

  public validateAggregManuProdAllChecks(
    loadedCoil: SteelCoilDetailsDTO,
    selectedDate: string,
    product: ManufacturedProductFlatMapped,
    estMtrsRemaining: number,
  ): boolean {
    if (!this.runChecks(loadedCoil, selectedDate)) {
      console.log('runChecks failed');
      return false;
    }

    if (!this.checkCoilHasEnoughMtrsForAggreProd(product, estMtrsRemaining)) {
      console.log('checkCoilHasEnoughMtrsForAggreProd failed');
      return false;
    }

    return true;
  }

  public validateGroupedProductsAllChecks(
    loadedCoil: SteelCoilDetailsDTO,
    selectedDate: string,
    totalMtrsNeeded: number,
  ): boolean {
    if (!this.runChecks(loadedCoil, selectedDate)) {
      console.log('runChecks failed');
      return false;
    }

    if (!this.checkSteelCoilLengthIsEnough(totalMtrsNeeded, loadedCoil)) {
      console.log('checkSteelCoilLengthIsEnough failed');
      return false;
    }

    return true;
  }

  private runChecks(loadedCoil: SteelCoilDetailsDTO, selectedDate: string): boolean {
    if (!loadedCoil.steelCoilId) {
      this.alertService.displayAlert('warning', 'ERROR: coilId is undefined');
      return false;
    }

    if (!selectedDate) {
      this.alertService.displayAlert('warning', 'ERROR: Select Date is undefined');
      return false;
    }
    return true;
  }

  private checkCoilHasEnoughMtrsForAggreProd(
    product: ManufacturedProductFlatMapped,
    estMtrsRemaining: number,
  ): boolean {
    if (!product) {
      this.alertService.displayAlert('warning', `Product not found.`);
      return false;
    }

    const totalMtrsNeeded = product.length;
    if (totalMtrsNeeded > estMtrsRemaining) {
      this.alertService.displayAlert('warning', 'Not enough meters on coil to manufacture.');
      return false;
    }

    return true;
  }

  checkSteelCoilLengthIsEnough(totalMtrsNeeded: number, loadedCoil: SteelCoilDetailsDTO): boolean {
    if (totalMtrsNeeded > loadedCoil.estMtrsRemaining) {
      this.alertService.displayAlert('warning', 'Not enough meters on coil to manufacture.');

      console.log('ERROR: Not enough meters on coil to manufacture group of products');
      return false;
    } else {
      console.log('Enough meters on coil to manufacture group of products');
      return true;
    }
  }
}

import { Injectable } from '@angular/core';
import { AlertService } from './alert-cutting-list.service';
import { ProductManufacturedDTO } from '../../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { SteelCoilDetailsDTO } from '@shared/models/steelCoilDetailsDTO';
import { AggregateProductsService } from '../../aggregated-products/aggregate-products.service';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { Observable, map, catchError, of } from 'rxjs';
import { ManufacturedProductService } from '../../cutting-lists/services/manufacturedProduct.service';
import { ManufacturedProduct } from '../../cutting-lists/models/manufacturedProduct';
import { ManufacturedResponse } from '../models/manufacturedResponse';

@Injectable({
  providedIn: 'root',
})
export class CuttingListManufacturingService {
  constructor(
    private alertService: AlertService,
    private aggregatedProductService: AggregateProductsService,
    private manufacturedProductService: ManufacturedProductService,
  ) {}

  aggregateProductManufactured(
    productId: number,
    loadedCoil: SteelCoilDetailsDTO,
    selectedDate: string,
  ): Observable<number | null> {
    const productManufacturedDTO: ProductManufacturedDTO = {
      productId,
      coilId: loadedCoil.steelCoilId,
      dateManufactured: selectedDate,
    };

    return this.aggregatedProductService.productManufactured(productManufacturedDTO).pipe(
      map((amp: AggregatedProduct) => amp.length),
      catchError((err) => {
        console.error('Error manufacturing product:', err);
        this.alertService.displayAlert('warning', err.error.message);
        return of(null);
      }),
    );
  }

  persistManufacturedProduct(dto: ProductManufacturedDTO): Observable<number | null> {
    return this.manufacturedProductService.productManufactured(dto).pipe(
      map((manufacturedProduct: ManufacturedProduct) => manufacturedProduct.totalLength),
      catchError((err) => {
        console.error('Error manufacturing product:', err);
        this.alertService.displayAlert('warning', err.error.message);
        return of(null);
      }),
    );
  }

  manufactureGroupProductsSheets(
    dto: ProductManufacturedDTO[],
  ): Observable<ManufacturedResponse | null> {
    return this.manufacturedProductService.groupOfSheetsManufactured(dto).pipe(
      map((manufacturedProduct: ManufacturedResponse) => manufacturedProduct),
      catchError((err) => {
        console.error('Error manufacturing product:', err);
        this.alertService.displayAlert('warning', err.error.message);
        return of(null);
      }),
    );
  }
}

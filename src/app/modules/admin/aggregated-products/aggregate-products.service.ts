import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ProductManufacturedDTO } from '../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { AggregatedProduct } from './aggregatedProducts';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CuttingListStatusService } from '../cutting-list/services/cutting-list-status.service';

@Injectable({
  providedIn: 'root',
})
export class AggregateProductsService {
  private baseUrl = environment.baseUrl + 'aggregated-products';

  constructor(
    private httpClient: HttpClient,
    private cuttingListStatusService: CuttingListStatusService,
  ) {}

  /**
   * Marks a product as manufactured and updates the cutting list state.
   * @param productManufacturedDTO The DTO containing product manufacturing details.
   * @returns An observable of the aggregated manufactured product.
   */
  productManufactured(
    productManufacturedDTO: ProductManufacturedDTO,
  ): Observable<AggregatedProduct> {
    console.log(productManufacturedDTO);
    return this.httpClient
      .patch<AggregatedProduct>(`${this.baseUrl}/product-manufactured`, productManufacturedDTO)
      .pipe(
        tap((amp) => {
          this.updateCuttingListStateAfterManufacture(amp);
        }),
        catchError(this.handleError),
      );
  }

  /**
   * Updates the cutting list state with the newly manufactured product.
   * @param manufacturedProduct The product that has been manufactured.
   */
  private updateCuttingListStateAfterManufacture(updatedAMP: AggregatedProduct): void {
    this.cuttingListStatusService.handleAggregatedProductManufacturedSuccess(updatedAMP.id);
  }

  /**
   * Handles HTTP errors.
   * @param error The HTTP error response.
   * @returns An observable error.
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred in AggregateProductsService:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

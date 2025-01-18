import { Injectable } from '@angular/core';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { ManufacturedProduct } from '../../cutting-lists/models/manufacturedProduct';
import { ProductService } from '../../product/product.service';
import { ManufacturedProductService } from '../../cutting-lists/services/manufacturedProduct.service';
import { ProductDataService } from './product-data.service';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { ProductInformation } from '../../cutting-lists/models/cuttingListInformationDTO';
import { ProductManufacturedDTO } from '../../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { ProductStatus } from '@shared/enums/product-status';

@Injectable({
  providedIn: 'root',
})
export class CuttingListStatusService {
  constructor(
    private productDataService: ProductDataService,
    private productService: ProductService,
    private manufacturedProductService: ManufacturedProductService,
  ) {}

  /**
   * Checks if the entire cutting list is complete by verifying each manufactured product.
   * @param cuttingList The cutting list to check.
   * @returns True if complete, else false.
   */
  // private isCuttingListComplete(cuttingList: ProductDTO): boolean {
  //   return cuttingList.aggregatedProducts.every((mp) => this.isManufacturedProductComplete(mp));
  // }

  private isProductComplete(product: ProductDTO): boolean {
    return product.aggregatedProducts.every((amp) => amp.status === 'completed');
  }

  /**
   * Checks if a manufactured product is complete by verifying each aggregated product's status.
   * @param mp The manufactured product to check.
   * @returns True if complete, else false.
   */

  private isManufacturedProductComplete(mp: ManufacturedProduct): boolean {
    return mp.aggregatedProducts.every((amp) => amp.status === 'completed');
  }

  private isAggregatedProductComplete(mp: AggregatedProduct): boolean {
    return mp.status === 'completed';
  }

  /**
   * Changes the status of the cutting list to 'completed'.
   * @param cuttingListInfo Information about the cutting list.
   * @returns An observable of the updated cutting list information.
   */
  private updateCuttingListStatus(
    cuttingListInfo: ProductInformation,
  ): Observable<ProductInformation> {
    return this.productService.changeProductStatus(cuttingListInfo.product.id, 'completed').pipe(
      tap((updatedList) => {
        console.log('Cutting List Status Changed to Completed:', updatedList);
        cuttingListInfo.product = updatedList;
      }),
      map(() => cuttingListInfo),
      catchError((err) => {
        console.error('Error changing cutting list status:', err);
        return of(cuttingListInfo);
      }),
    );
  }

  /**
   * Handles the successful update of an aggregated manufactured product.
   * @param ampId The ID of the aggregated manufactured product.
   */
  public handleAggregatedProductManufacturedSuccess(ampId: number): void {
    const currentCuttingListInfo = this.productDataService.getCuttingList();
    const product = currentCuttingListInfo.product;
    let updatedMp: AggregatedProduct | undefined;

    // Update the status of the specific aggregated manufactured product
    // for (const mp of cuttingList.aggregatedProducts) {
    const amp = product.aggregatedProducts.find((a) => a.id === ampId);
    if (amp) {
      amp.status = 'completed';
      updatedMp = amp;
    }
    // }

    if (!updatedMp) {
      console.error('Aggregated Manufactured Product not found');
      return;
    }

    // If the manufactured product is complete, update its status
    if (this.isAggregatedProductComplete(updatedMp)) {
      this.manufacturedProductService
        .changeManufacturedProductStatus(updatedMp.id, 'completed')
        .pipe(
          tap(() => {
            updatedMp.status = 'completed';
          }),
          switchMap(() => {
            const isComplete = this.isProductComplete(product);
            if (isComplete) {
              return this.updateCuttingListStatus(currentCuttingListInfo);
            } else {
              this.productDataService.setCuttingList(currentCuttingListInfo);
              return of(currentCuttingListInfo);
            }
          }),
        )
        .subscribe((updatedCuttingList) => {
          if (this.isProductComplete(updatedCuttingList.product)) {
            this.productDataService.setCuttingList(updatedCuttingList);
          }
        });
    } else {
      this.productDataService.setCuttingList(currentCuttingListInfo);
    }
  }

  /**
   * Updates a manufactured product's status within the cutting list.
   * @param manufacturedProduct The manufactured product to update.
   */
  public updateManufacturedProductInCuttingList(manufacturedProductId: number): void {
    const currentCuttingListInfo = this.productDataService.getCuttingList();
    const cuttingList = currentCuttingListInfo.product;

    // Update the status of the manufactured product and its aggregated products
    // cuttingList.aggregatedProducts.forEach((mp) => {
    //   if (mp.id === manufacturedProductId) {
    //     mp.status = 'completed';
    cuttingList.aggregatedProducts.forEach((amp) => (amp.status = 'completed'));
    // }
    // });

    console.log('Updated Manufactured Products:');
    cuttingList.aggregatedProducts.forEach((mp) => console.log('MP:', mp.id, mp.status));

    // Check and update the cutting list status
    if (this.isProductComplete(cuttingList)) {
      console.log('Cutting list status is completed.');
      this.updateCuttingListStatus(currentCuttingListInfo).subscribe((updatedCuttingList) =>
        this.productDataService.setCuttingList(updatedCuttingList),
      );
    } else {
      console.log('Cutting list status is NOT completed.');
      this.productDataService.setCuttingList(currentCuttingListInfo);
    }
  }

  /**
   * Handles the successful manufacturing of grouped sheets.
   * @param groupedProducts The grouped products that were manufactured.
   */
  public handleGroupedSheetsManufacturedSuccess(groupedProducts: ProductManufacturedDTO[]): void {
    const currentCuttingListInfo = this.productDataService.getCuttingList();
    const product = currentCuttingListInfo.product;

    // Update the status of each grouped manufactured product
    // groupedProducts.forEach((dtoProduct) => {
    const mp = product.aggregatedProducts;
    //     .find(
    //   (products) => product.id === dtoProduct.productId,
    // );
    if (mp) {
      console.log('Product found ===>:', mp);
      product.status = ProductStatus.COMPLETED;
      product.aggregatedProducts.forEach((amp) => (amp.status = 'completed'));
    }
    // });

    // Check and update the cutting list status
    if (this.isProductComplete(product)) {
      console.log('Cutting list status is completed.');
      this.updateCuttingListStatus(currentCuttingListInfo).subscribe((updatedCuttingList) =>
        this.productDataService.setCuttingList(updatedCuttingList),
      );
    } else {
      console.log('Cutting list status is NOT completed.');
      this.productDataService.setCuttingList(currentCuttingListInfo);
    }
  }
}

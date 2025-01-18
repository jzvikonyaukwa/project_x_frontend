import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { ProductInformation } from '../../cutting-lists/models/cuttingListInformationDTO';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductDataService {
  private baseUrl = environment.baseUrl + 'products/';

  private productSubject: BehaviorSubject<ProductInformation> =
    new BehaviorSubject<ProductInformation>(null);

  public product$: Observable<ProductInformation> = this.productSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  public setCuttingList(cuttingList: ProductInformation): void {
    this.productSubject.next(cuttingList);
  }

  public getCuttingList(): ProductInformation {
    return this.productSubject.getValue();
  }

  public getProduct(): ProductInformation {
    return this.productSubject.getValue();
  }

  fetchCuttingListInformation(productId: number): void {
    console.log('Fetching product list information for product list ID:', productId);
    this.httpClient.get<ProductInformation>(this.baseUrl + productId).subscribe({
      next: (product) => this.setCuttingList(product),
      error: (error) => {
        console.error('Error fetching product list:', error);
      },
    });
  }

  /**
   * Updates the cutting list state with new information.
   * @param cuttingList The updated cutting list information.
   */
  updateCuttingListState(cuttingList: ProductInformation): void {
    this.productSubject.next(cuttingList);
  }

  /**
   * Clears the cutting list state.
   */
  clearCuttingList(): void {
    this.productSubject.next(null);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Observable } from 'rxjs';
import { ProductInStock } from '../../models/productInStock';
import { ProductForStockOnHandDTO } from '@shared/models/productForStockOnHandDTO';
import { MadeProduct } from '../../models/madeProduct';
import { StockOnHand } from '../models/stock-on-hand';
import { ProductPickedDTO } from 'app/modules/manufacturing/manufacture-product/models/product-picked.dto';
import { AggregatedProduct } from 'app/modules/admin/aggregated-products/aggregatedProducts';

@Injectable({
  providedIn: 'root',
})
export class StockOnHandService {
  private baseUrl = environment.baseUrl + 'stock-on-hand';

  constructor(private http: HttpClient) {}

  public getAvailableStockOnHand(): Observable<StockOnHand[]> {
    return this.http.get<StockOnHand[]>(this.baseUrl + '/available');
  }

  // Currently not used
  public getAllStockOnHand(): Observable<MadeProduct[]> {
    return this.http.get<MadeProduct[]>(this.baseUrl + '/products');
  }

  public getStockOnHandForProductType(
    productType: string,
    color: string,
    gauge: number,
  ): Observable<StockOnHand[]> {
    return this.http.get<StockOnHand[]>(
      this.baseUrl + '/product-type/' + productType + '/' + color + '/' + gauge,
    );
  }

  public addProductToStockOnHand(product: ProductForStockOnHandDTO): Observable<ProductInStock> {
    return this.http.post<ProductInStock>(this.baseUrl, product);
  }

  public productPicked(productPickedDTO: ProductPickedDTO): Observable<AggregatedProduct> {
    return this.http.patch<AggregatedProduct>(this.baseUrl + '/product-picked', productPickedDTO);
  }
}

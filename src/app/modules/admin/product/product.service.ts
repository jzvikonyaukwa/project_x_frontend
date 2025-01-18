import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.development';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { MachinesCuttingListsDTO } from '../cutting-lists/models/machinesCuttingListsDTO';
import { ProductInformation } from '../cutting-lists/models/cuttingListInformationDTO';
import { ProductDTO } from '../cutting-lists/models/productDTO';
import { PriceAndProductTypeDTO } from '../quotes/models/priceAndProductTypeDTO';
import { ProductSummaryDetailsDTO } from '../cutting-lists/models/productSummaryDetailsDTO';
import { CreateProductDTO } from '../quotes/quote/add-product/models/createProductDTO';
import { ProductManufacturedDTO } from 'app/modules/manufacturing/manufacture-product/models/productManufacturedDTO';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = environment.baseUrl + 'products';

  private productInProgress = new BehaviorSubject<ProductSummaryDetailsDTO>(null);

  public productInProgress$ = this.productInProgress.asObservable();

  constructor(private httpClient: HttpClient) {}

  getProductInfo(productId: number): Observable<MachinesCuttingListsDTO> {
    return this.httpClient.get<MachinesCuttingListsDTO>(
      `${this.baseUrl}/product-information/${productId}`,
    );
  }

  getProductInProgressForMachine(width: number): Observable<ProductSummaryDetailsDTO> {
    return this.httpClient
      .get<ProductSummaryDetailsDTO>(`${this.baseUrl}/in-progress/width/` + width)
      .pipe(
        tap((productInProgress) => {
          this.productInProgress.next(productInProgress);
        }),
      );
  }

  getProductScheduledForProduct(width: number): Observable<ProductSummaryDetailsDTO[]> {
    return this.httpClient.get<ProductSummaryDetailsDTO[]>(`${this.baseUrl}/width/` + width);
  }

  getProductInformation(productId: number): Observable<ProductInformation> {
    return this.httpClient.get<ProductInformation>(`${this.baseUrl}/` + productId);
  }

  getProductById(productId: number): Observable<ProductDTO> {
    return this.httpClient.get<ProductDTO>(this.baseUrl + '/' + productId);
  }

  getCompletedProducts(pageNo: number, pageSize: number,filters: string): Observable<{productDTO:ProductDTO[], totalElements: number}> {
    let params = new HttpParams()
        .set('pageNo', pageNo)
        .set('pageSize', pageSize);

    if (filters) {
      params = params.set('filters', filters);
    }

    console.log(params + "filters ---->" +filters);

    return this.httpClient.get<{productDTO:ProductDTO[], totalElements: number}>(`${this.baseUrl}/completed`,{params});
  }

  updateProductV2(quoteId: number, product: CreateProductDTO) {
    console.log('updateProductV2', product);
    return this.httpClient.put<ProductDTO>(`${this.baseUrl}/update/quote-v2/` + quoteId, product);
  }

  changeProductStatus(productId: number, status: string): Observable<ProductDTO> {
    return this.httpClient.patch<ProductDTO>(
      `${this.baseUrl}/change-status/` + productId + '/' + status,
      {},
    );
  }

  createPastedProduct(productData: ProductDTO, quoteId: number): Observable<ProductDTO> {
    console.log('<==||createPastedProduct||==>', productData);
    return this.httpClient.post<ProductDTO>(
      `${this.baseUrl}/create-pasted-product-v2/` + quoteId,
      productData,
    );
  }

  createProductV2(createProductDTO: CreateProductDTO, quoteId: number): Observable<ProductDTO> {
    return this.httpClient.post<ProductDTO>(
      `${this.baseUrl}/create-product-v2/` + quoteId,
      createProductDTO,
    );
  }

  updateProductPrice(priceAndProductTypeDTO: PriceAndProductTypeDTO): Observable<ProductDTO> {
    return this.httpClient.post<ProductDTO>(
      `${this.baseUrl}/update-product-price`,
      priceAndProductTypeDTO,
    );
  }

  deleteAProduct(productId: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/delete-product/${productId}`);
  }

  productManufactured(details: ProductManufacturedDTO): Observable<ProductDTO> {
    return this.httpClient.patch<ProductDTO>(`${this.baseUrl}/product-manufactured`, details);
  }

  getAveragePriceForProduct(colorId: number,gaugeId :number,widthId: number): Observable<number> {
    console.log("widthId: number,gaugeId :number,colorId: number",colorId,gaugeId ,widthId)
    return this.httpClient.get<number>(`${this.baseUrl}/average-price/${colorId}/${gaugeId}/${widthId}`);
  }
}

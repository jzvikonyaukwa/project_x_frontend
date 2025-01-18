import { Injectable } from '@angular/core';
import { ManufacturedProduct } from '../models/manufacturedProduct';
import { ProductManufacturedDTO } from '../../../manufacturing/manufacture-product/models/productManufacturedDTO';
import { ProductDTO } from '../models/productDTO';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingService {
  getGroupProductsDTO(
    products: ProductDTO,
    loadedCoilId: number,
    date: string,
  ): ProductManufacturedDTO[] {
    const groupedProductsToManufacturedDTO: ProductManufacturedDTO[] = [];

    // products.aggregatedProducts.forEach((product) => {
    const productManufacturedDTO: ProductManufacturedDTO = {
      productId: products.id,
      coilId: loadedCoilId,
      dateManufactured: date,
    };
    groupedProductsToManufacturedDTO.push(productManufacturedDTO);
    // });

    console.log(
      'groupedProductsToManufacturedDTO to manufacture: ',
      groupedProductsToManufacturedDTO,
    );

    return groupedProductsToManufacturedDTO;
  }

  getProductsToManufactureFromFrameName(
    frameName: string,
    manufactruringProducts: ManufacturedProduct[],
  ): ManufacturedProduct[] {
    console.log('framename = ', frameName);
    return manufactruringProducts.filter(
      (product) => product.frameName === frameName && product.status === 'scheduled',
    );
  }

  getProductsToManufactureFromLength(length: number, products: ProductDTO): AggregatedProduct[] {
    return products.aggregatedProducts.filter(
      (product) => product.length === length && product.status === 'scheduled',
    );
  }

  getTotalMtrsNeeded(productsToManufacture: ProductDTO): number {
    return productsToManufacture.aggregatedProducts.reduce((acc, product) => {
      return acc + product.length;
    }, 0);
  }
}

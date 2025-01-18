import { Injectable } from '@angular/core';
import {
  ManufacturedProduct,
  ManufacturedProductWithPickable,
} from '../../cutting-lists/models/manufacturedProduct';
import { MadeProduct } from 'app/modules/admin/stock/models/madeProduct';
import { GroupedSheetMPs } from '../models/groupedSheetProducts';
import { GroupedFramecadMPs } from '../models/groupedFramecadManufacturedProducts';
import { ManufacturedProductFlatMapped } from '../models/manufactured-products-flatmapped';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';

@Injectable({
  providedIn: 'root',
})
export class CuttingListUtilsService {
  addPickableToData(
    products: ProductDTO,
    remainingStockOnHand: MadeProduct[],
  ): ManufacturedProductFlatMapped[] {
    const dataWithPickable: ManufacturedProductFlatMapped[] = [];

    console.log('========><========', products);

    // products.forEach((product) => {
    products.aggregatedProducts.forEach((aggregatedProduct) => {
      console.log('Aggregated Product: ', aggregatedProduct);
      const flatManufacturedProduct: ManufacturedProductFlatMapped = {
        id: aggregatedProduct.id,
        code: aggregatedProduct.code,
        productStatus: products.status,
        frameName: products.frameName,
        frameType: products.frameType,
        stickType: aggregatedProduct.stickType,
        stick: aggregatedProduct.stick,
        length: aggregatedProduct.length,
        aggProdStatus: aggregatedProduct.status,
        pickable: false,
      };

      dataWithPickable.push(flatManufacturedProduct);
      // });

      // const pickable = this.isProductAvailable(
      //   product.length,
      //   product.frameType,
      //   product.stickType,
      //   remainingStockOnHand
      // );
      // const pickable = false;

      // const productWithPickable: ManufacturedProductWithPickable = {
      //   ...product,
      //   pickable,
      // };

      // dataWithPickable.push({ ...productWithPickable });
    });

    // console.log('Data with Pickable: ', dataWithPickable);

    console.log('Data with Pickable: ', dataWithPickable);
    return dataWithPickable;
  }

  isProductAvailable(
    length: number,
    frameType: string,
    stickType: string,
    remainingStockOnHand: MadeProduct[],
  ): boolean {
    let result = false;

    if (remainingStockOnHand) {
      for (let i = 0; i < remainingStockOnHand.length; i++) {
        const product = remainingStockOnHand[i];
        if (
          product.length === length &&
          product.frameType.toLocaleLowerCase() === frameType.toLocaleLowerCase() &&
          product.stickType.toLocaleLowerCase() === stickType.toLocaleLowerCase()
        ) {
          result = true;
          remainingStockOnHand.splice(i, 1);
          break;
        }
      }
    }

    return result;
  }

  public groupRoofSheetProducts(
    products: ProductDTO,
    remainingStockOnHand: MadeProduct[],
  ): GroupedSheetMPs[] {
    const groupedData: GroupedSheetMPs[] = [];

    products.aggregatedProducts.forEach((product: AggregatedProduct) => {
      let pickable;
      if (product.status === 'completed') {
        pickable = false;
      } else {
        // pickable = this.isProductAvailable(
        //   product.totalLength,
        //   product.frameType,
        //   product.stickType,
        //   remainingStockOnHand
        // );
      }

      if (pickable) {
        // const pickableProduct: GroupedSheetMPs = {
        //   id: product.id,
        //   length: product.length,
        //   totalLength: product.length,
        //   qty: 1,
        //   status: product.status,
        //   pickable: true,
        // };
        // groupedData.push(pickableProduct);
      } else {
        const existingProduct = groupedData.find(
          (groupedProd) =>
            groupedProd.length === product.length &&
            groupedProd.status === product.status &&
            !groupedProd.pickable,
        );

        if (existingProduct) {
          existingProduct.totalLength += product.length;
          existingProduct.qty += 1;
        } else {
          const groupedProduct: GroupedSheetMPs = {
            length: product.length,
            totalLength: product.length,
            qty: 1,
            status: product.status,
            pickable: false,
          };
          groupedData.push(groupedProduct);
        }
      }
    });

    groupedData.forEach((group) => (group.totalLength = Math.round(group.totalLength * 100) / 100));

    // console.log('Grouped Data: ', groupedData);

    return groupedData;
  }

  public groupFramecadDesignedProducts(
    products: ProductDTO,
    remainingStockOnHand: MadeProduct[],
  ): GroupedFramecadMPs[] {
    const groupedData: GroupedFramecadMPs[] = [];

    // TODO handle pickable logic

    products.aggregatedProducts.forEach((mp: AggregatedProduct) => {
      const row: GroupedFramecadMPs = {
        id: products.id, // for ag-grid getRowID()
        planName : products.planName,
        frameType: products.frameType,
        frameName: products.frameName,
        mp: mp,
        pickable: false,
        remainingQty: 0,
        completedQty: 0,
        lengthRemaining: 0,
      };

      // for (let amp of mp.aggregatedProducts) {
      if (mp.status === 'completed') {
        row.completedQty += 1;
      } else {
        row.lengthRemaining += mp.length;
        row.remainingQty += 1;
      }
      // }
      groupedData.push(row);
    });
    return groupedData;
  }

  // NOT sure if this is being used.
  public checkIfCuttingListIsCompleted(manufacturedProducts: ManufacturedProduct[]): boolean {
    console.log('Checking if cutting list is completed');
    for (let i = 0; i < manufacturedProducts.length; i++) {
      const product = manufacturedProducts[i];
      if (product.status == 'scheduled') {
        console.log('Cutting list is NOT completed');
        return false;
      }
    }
    console.log('Cutting list is completed');
    return true;
  }
}

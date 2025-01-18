import { Injectable } from '@angular/core';
import { ProductInputtedRows } from '../models/cuttingListRow';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { ProductStatus } from '@shared/enums/product-status';
import { Gauge } from '@shared/models/gauge';
import { Color } from '@shared/models/color';
import { Width } from '@shared/models/width';
import {AggregatedPastedProduct, AggregatedProduct} from '../../aggregated-products/aggregatedProducts';

@Injectable({
  providedIn: 'root',
})
export class ConvertInputtedRowsToCuttingListService {
  convertToProduct(
    productInputtedRows: ProductInputtedRows[],
    gauge: Gauge,
    color: Color,
    width: Width,
    codeName: string,
  ): ProductDTO | undefined {
    if (!productInputtedRows || productInputtedRows.length === 0) {
      return undefined;
    }

    // Sort the rows to ensure the correct order
    this.sortCuttingListRows(productInputtedRows);

    // Create the initial cutting list DTO
    // TODO: Change this by creating new DTO for handling pasted Data
    const productDTO: ProductDTO = {
      profile: null,
      status: ProductStatus.SCHEDULED,
      dateWorkBegan: null,
      dateWorkCompleted: null,
      lastWorkedOn: null,
      targetDate: new Date(),
      priority: 'normal',
      planName: null,
      aggregatedProducts: [],
      canInvoice: true,
      productType:null,
      color,
      gauge,
      width,
      sellPrice:0.0,
    };

    // Check if the plan name is 'Purlins' or 'Battens'
    const isPurlinsOrBattens = ['Purlins', 'Battens'].includes(productInputtedRows[0].planName);
    let codeCount = 0;

    // Special handling for 'Purlins' or 'Battens'
    if (isPurlinsOrBattens) {
      this.createAggregatedManufacturedProductForPurlinAndBatten(productDTO, codeName, codeCount);
    }
    productDTO.aggregatedProducts.push(
        ...productInputtedRows.map(row => this.createAggregatedManufacturedProduct(row, row.frameName, 1))
    );


    console.log('Finished___', productDTO);
    return productDTO;
  }

  createAggregatedManufacturedProductForPurlinAndBatten(
    product: ProductDTO,
    codeName: string,
    codeCount: number,
  ) {
    const totalLength = Math.ceil(product.totalLength / 6) * 6;
    const numberOfPieces = Math.ceil(totalLength / 6);
    product.totalQuantity = numberOfPieces;
    product.totalLength = totalLength;

    for (let i = 0; i < numberOfPieces; i++) {
      const aggProduct = this.createPandBEmptyAggregatedManufacturedProduct(codeName, codeCount++);
      product.aggregatedProducts.push(aggProduct);
    }
  }

  createNewManufacturedProduct(row: ProductInputtedRows): ProductDTO {
    return {
      profile: null,
      dateWorkBegan: null,
      dateWorkCompleted: null,
      lastWorkedOn: null,
      targetDate: null,
      priority: 'normal',
      planName: row[0]?.planName || '',
      frameName: row?.frameName || '',
      frameType: row?.frameType || '',
      status: 'scheduled' as ProductStatus,
      totalLength: Number(row.length) || 0,
      totalQuantity: 1,
      aggregatedProducts: [],
      canInvoice: true,
      color: null,
      gauge: null,
      width: null,
      sellPrice:0,
    };
  }

  createAggregatedManufacturedProduct(
    row: ProductInputtedRows,
    codeName: string,
    codeCount: number,
  ): AggregatedPastedProduct {
    return {
      stick: row.stick,
      stickType: row.stickType,
      code: `${codeName}-${codeCount}`,
      length: row.length,
      status: 'scheduled',
      planName:row.planName,
      frameName:row.frameName,
      frameType:row.frameType
    };
  }

  createPandBEmptyAggregatedManufacturedProduct(
    codeName: string,
    codeCount: number,
  ): AggregatedPastedProduct {
    return {
      stick: null,
      stickType: null,
      code: `${codeName}-${codeCount}`,
      length: 6,
      status: 'scheduled',
      planName:'Purlins',
      frameName:null,
      frameType:null
    };
  }

  sortCuttingListRows(rows: ProductInputtedRows[]): ProductInputtedRows[] {
    return rows.sort((a, b) => {
      const planNameComparison = a.planName.localeCompare(b.planName);
      if (planNameComparison !== 0) return planNameComparison;

      const frameNameComparison = a.frameName.localeCompare(b.frameName);
      if (frameNameComparison !== 0) return frameNameComparison;

      return a.frameType.localeCompare(b.frameType);
    });
  }
}

import { Injectable } from '@angular/core';
import { ProductDTO } from '../../cutting-lists/models/productDTO';
import { ConsumableOnQuote } from '../../consumables/models/consumableOnQuote';
import { Quote } from '../models/quote';
import { QuoteTotals } from '../models/quoteTotals';
import BigNumber from 'bignumber.js';
import { AggregatedProduct } from '../../aggregated-products/aggregatedProducts';
import { filter, isEmpty } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class QuoteCalculationsService {
  calculateQuoteTotals(quote: Quote | null): QuoteTotals {
    if (!quote) {
      return {
        totalRawMaterialCost: 0,
        externalCost: 0,
        markUpCharged: 0,
        totalExcVat: 0,
        totalVat: 0,
        totalIncVat: 0,
      } as QuoteTotals;
    }
    const rawProductsCostTotal: number = this.calculateProductsCostTotal(quote.products);

    console.debug('=====?>rawProductsCostTotal: ', rawProductsCostTotal);
    const consumablesFinalCostTotal: number = this.calculateConsumablesTotalCostWithMarkup(
      quote.consumablesOnQuote,
    );
    console.debug('consumablesFinalCostTotal: ', consumablesFinalCostTotal);

    if (!rawProductsCostTotal && !consumablesFinalCostTotal) {
      return {
        totalRawMaterialCost: 0,
        externalCost: 0,
        markUpCharged: 0,
        totalExcVat: 0,
        totalVat: 0,
        totalIncVat: 0,
      } as QuoteTotals;
    }

    const consumablesMarkupAmount: number = this.calculateConsumablesMarkup(
      quote.consumablesOnQuote,
    );

    console.debug('consumablesMarkupAmount: ', consumablesMarkupAmount);

    const rawConsumablesCostTotal: number = BigNumber(consumablesFinalCostTotal)
      .minus(consumablesMarkupAmount)
      .decimalPlaces(2)
      .toNumber();
    console.debug('rawConsumablesCostTotal: ', rawConsumablesCostTotal);

    const productsCostWithMarkup: number = this.totalCostWithMarkUpProducts(quote.products);
    console.debug('productsCostWithMarkup: ==>>???? ', productsCostWithMarkup);
    console.debug('rawProductsCostTotal: ', rawProductsCostTotal);


    const productsTotalMarkupAmount: number = BigNumber(productsCostWithMarkup)
      .minus(rawProductsCostTotal)
      .decimalPlaces(2)
      .toNumber();

    console.debug('productsTotalMarkupAmount: ', productsTotalMarkupAmount);

    const materialsCostTotal: number = BigNumber(rawProductsCostTotal)
      .plus(BigNumber(rawConsumablesCostTotal))
      .decimalPlaces(2)
      .toNumber();
    console.debug('materialsCostTotal: ', materialsCostTotal);

    const materialsTotalMarkup: number = BigNumber(productsTotalMarkupAmount)
      .plus(BigNumber(consumablesMarkupAmount))
      .decimalPlaces(2)
      .toNumber();
    console.debug('materialsTotalMarkup: ', materialsTotalMarkup);

    const materialsCostWithMarkupTotal: number = BigNumber(materialsCostTotal)
      .plus(materialsTotalMarkup)
      .decimalPlaces(2)
      .toNumber();
    console.debug('materialsCostWithMarkupTotal: ', materialsCostWithMarkupTotal);

    return {
      totalRawMaterialCost: materialsCostTotal,
      externalCost: 0,
      markUpCharged: materialsTotalMarkup,
      totalExcVat: materialsCostWithMarkupTotal,
      totalVat: BigNumber(materialsCostWithMarkupTotal).times(0.15).decimalPlaces(2).toNumber(),
      totalIncVat: BigNumber(materialsCostWithMarkupTotal).times(1.15).decimalPlaces(2).toNumber(),
    } as QuoteTotals;
  }

  calculateProductsCostTotal(products: ProductDTO[]): number {
    if (!products?.length) {
      return 0;
    }

    return products
      .reduce((runningTotalCost: BigNumber, product: ProductDTO) => {
        const rawProductCost = this.totalCostOfProduct(product);
        console.log('rawProductCost: ', rawProductCost);
        return runningTotalCost.plus(rawProductCost);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  totalCostOfProduct(product: ProductDTO): number {
    if (product.costPrice == null || product.planName == null) {
      return 0;
    }

    const productLength = this.totalLengthOfProduct(product);

    const costPrice = product.costPrice;
    const planName = product?.planName.toLocaleLowerCase();

    if (planName === 'purlins' || planName === 'battens') {
      return this.calculatePurlinOrBattenCost(productLength, costPrice);
    }

    return this.calculateSheetCost(productLength, costPrice);
  }

  /**
   * Calculates total cost for purlin or batten based on length and unit price.
   *
   * @param purlinOrBattenLength Length of purlin or batten.
   * @param unitPrice Unit price of purlin or batten.
   * @returns The calculated total cost.
   */
  calculatePurlinOrBattenCost(purlinOrBattenLength: number, unitPrice: number): number {
    const sheetsNeeded = Math.ceil(purlinOrBattenLength / 6); // Calculate number of sheets needed.
    const billableLength = sheetsNeeded * 6; // Calculate total billable length.
    return BigNumber(billableLength).times(BigNumber(unitPrice)).decimalPlaces(2).toNumber();
  }

  /**
   * Calculates total cost for a sheet given its length and unit price.
   *
   * @param sheetLength Length of the sheet.
   * @param unitPrice Price per unit of length.
   * @returns Total cost of the sheet.
   */
  calculateSheetCost(sheetLength: number, unitPrice: number): number {
    return BigNumber(sheetLength).times(BigNumber(unitPrice)).decimalPlaces(2).toNumber();
  }

  calculateConsumablesTotalCostWithMarkup(consumables: ConsumableOnQuote[]): number {
    if (!consumables?.length) {
      return 0;
    }

    return consumables
      .reduce((runningTotalCost: BigNumber, consumable: ConsumableOnQuote) => {
        const quantity = BigNumber(consumable?.qty || 0);
        const sellPrice = BigNumber(consumable?.sellPrice || 0);
        const itemCost = BigNumber(quantity).times(sellPrice);
        return runningTotalCost.plus(itemCost);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  calculateConsumablesMarkup(consumables: ConsumableOnQuote[]): number {
    return consumables
      .reduce((runningTotalMarkup: BigNumber, lineItem: ConsumableOnQuote) => {
        const markup = BigNumber(lineItem.sellPrice).minus(lineItem.costPrice);
        const markupAmount = BigNumber(lineItem.qty).times(markup);
        return runningTotalMarkup.plus(markupAmount);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  totalLengthOfProduct(product: ProductDTO): number {
    if (!product?.aggregatedProducts?.length) {
      return 0;
    }

    return product?.aggregatedProducts
      .reduce((runningTotalLength: BigNumber, aggregatedProduct: AggregatedProduct) => {
        const componentLength = BigNumber(aggregatedProduct?.length || 0);
        return runningTotalLength.plus(componentLength);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }


  totalCostWithMarkUpProducts(products: ProductDTO[]): number {
    if (!products?.length) {
      return 0;
    }

    return products
      .reduce((runningTotalCost: BigNumber, product: ProductDTO) => {
        const rawProductCost = this.totalCostOfProductWithMarkUp(product);
        console.log('rawProductCost: ', rawProductCost);
        return runningTotalCost.plus(rawProductCost);
      }, BigNumber(0))
      .decimalPlaces(2)
      .toNumber();
  }

  totalCostOfProductWithMarkUp(product: ProductDTO): number {
    if (product.sellPrice == null || product.planName == null) {
      return 0;
    }

    const productLength = this.totalLengthOfProduct(product);

    const sellPrice = product.sellPrice;
    const planName = product?.planName.toLocaleLowerCase();

    if (planName === 'purlins' || planName === 'battens') {
      return this.calculatePurlinOrBattenCost(productLength, sellPrice);
    }

    return this.calculateSheetCost(productLength, sellPrice);
  }

  validUsersNamedBuzz = function (users: Array<any>) {
    return filter(users, function (user) {
      return user.name === 'Buzz' && isEmpty(user.errors);
    });
  };
}
